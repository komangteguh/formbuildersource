import React from "react";
import { defaultProps } from 'recompose';
import { connect } from "react-redux";
import {bindActionCreators} from "redux";
import * as authActions from "../../../store/actions/authAction";
import TextAreaAutosize from "react-textarea-autosize";
import {ContentState, EditorState, convertFromHTML, convertToRaw, BlockMapBuilder, Modifier} from "draft-js";
import draftToHtml from "draftjs-to-html";
import {Editor} from "react-draft-wysiwyg";
import htmlToDraft from "html-to-draftjs";

import DynamicOptionList from "./dynamic-option-list";
import DynamicTableSetting from "./dynamic-table-setting";
import {get} from "./stores/requests";
import ID from "./UUID";
import LoadingSpinner from "../LoadingSpinner";

const toolbar = {
  options: [
    "inline",
    // "blockType",   // still have an issue on copy pasted this options
    "list",
    "textAlign",
    "fontSize",
    "link",
    "history"
  ],
  inline: {
    inDropdown: false,
    className: undefined,
    options: ["bold", "italic", "underline", "superscript", "subscript"],
  },
  list: {
    inDropdown: false,
    className: undefined,
    options: ['unordered', 'ordered', 'indent', 'outdent']
  },
  // blockType: {
  //   inDropdown: true,
  //   options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
  //   className: undefined,
  // }
};

const toolbarCamera = {
  options: [],
  inline: {},
};

class FormElementsEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: props.element,
      data: props.data,
      dirty: false,
      errorMessage: null,
    };
  }

  componentDidMount() {
    this.props.authAction.authCheckState();
  }

  toggleRequired() {
    // const this_element = this.state.element;
  }

  editElementProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    const this_element = this.state.element;
    this_element[elemProperty] = e.target[targProperty];

    this.setState(
      {
        element: this_element,
        dirty: true,
      },
      () => {
        if (targProperty === "checked") {
          this.updateElement();
        }
      }
    );
  }

  editImageProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    const self = this;
    const fileMax = 2048000;
    const errSize = "Image size too large (Max. Size 2 MB)";
    const errType = "Image file type is not supported";
    const imageTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/JPG",
      "image/JPEG",
      "image/PNG",
    ];
    const this_element = self.state.element;
    const target = e.target;
    let file;
    let reader;

    if (target.files && target.files.length) {
      file = target.files[0];

      if (!imageTypes.includes(file.type)) {
        self.setState({errorMessage: errType});
      } else if (file.size > fileMax) {
        self.setState({errorMessage: errSize});
      } else {
        // eslint-disable-next-line no-undef
        reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
          this_element[elemProperty] = reader.result;

          self.setState(
            {
              element: this_element,
              dirty: true,
              errorMessage: null,
            },
            () => {
              if (targProperty === "checked") {
                self.updateElement();
              }
            }
          );
        };
      }
    }
  }

  renderImage(src)
  {
    const token = this.props.token;
    const baseAssessmentUrl = process.env.REACT_APP_ASSESSMENT_ENDPOINT;
    const baseFormUrl = process.env.REACT_APP_FORM_ENDPOINT;

    let imageUrl = "";
    let data = src;

    if (src && src.toLowerCase().includes("/assessment")) {
      imageUrl = baseAssessmentUrl + src;
      fetch(imageUrl, {
        method: "GET",
        headers: { Authorization: 'Bearer ' + token }
      }).then(response => response.json())
        .then(data => {
          let element = this.state.element;
          element.src = data;
          this.setState({ element })          
        });

      return (
        <div style={{ width: "50px" }}>
          <LoadingSpinner></LoadingSpinner>
        </div>
      );
    }
    else if (src && src.toLowerCase().includes("/form")) {
      imageUrl = baseFormUrl + src;
      fetch(imageUrl, {
        method: "GET",
        headers: { Authorization: 'Bearer ' + token }
      }).then(response => response.json())
        .then(data => {
          let element = this.state.element;
          element.src = data;
          this.setState({ element })
        });

      return (
        <div style={{ width: "50px" }}>
          <LoadingSpinner></LoadingSpinner>
        </div>
      );
    }
    else {
      return (<img src={data} className="form-flex-0 m-10" />)
    }
  }

  clearImageProp(elemProperty, targProperty, e) {
    // elemProperty could be content or label
    // targProperty could be value or checked
    const self = this;
    const this_element = self.state.element;
    this_element[elemProperty] = "";

    self.setState(
      {
        element: this_element,
        dirty: true,
      },
      () => {
        if (targProperty === "checked") {
          self.updateElement();
        }
      }
    );
  }

  onEditorStateChange(index, property, editorContent) {
    const html = draftToHtml(convertToRaw(editorContent.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
    const this_element = this.state.element;
    this_element[property] = html;

    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateElement() {
    const this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({dirty: false});
    }
  }

  convertFromHTML(content) {
    const newContent = convertFromHTML(content);
    if (!newContent.contentBlocks || !newContent.contentBlocks.length) {
      // to prevent crash when no contents in editor
      return EditorState.createEmpty();
    }
    const contentBlock = htmlToDraft(content);
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
    return EditorState.createWithContent(contentState);
  }

  addOptions() {
    const optionsApiUrl = document.getElementById("optionsApiUrl").value;
    if (optionsApiUrl) {
      get(optionsApiUrl).then(data => {
        this.props.element.options = [];
        const {options} = this.props.element;
        data.forEach(x => {
          // eslint-disable-next-line no-param-reassign
          x.key = ID.uuid();
          options.push(x);
        });
        const this_element = this.state.element;
        this.setState({
          element: this_element,
          dirty: true,
        });
      });
    }
  }

  render() {
    if (this.state.dirty) {
      this.props.element.dirty = true;
    }

    const this_checked = this.props.element.hasOwnProperty("required")
      ? this.props.element.required
      : false;
    const this_read_only = this.props.element.hasOwnProperty("readOnly")
      ? this.props.element.readOnly
      : false;
    const this_default_today = this.props.element.hasOwnProperty("defaultToday")
      ? this.props.element.defaultToday
      : false;
    const this_show_time_select = this.props.element.hasOwnProperty("showTimeSelect")
      ? this.props.element.showTimeSelect
      : false;
    const this_show_time_select_only = this.props.element.hasOwnProperty(
      "showTimeSelectOnly"
    )
      ? this.props.element.showTimeSelectOnly
      : false;
    const this_checked_inline = this.props.element.hasOwnProperty("inline")
      ? this.props.element.inline
      : false;
    const this_checked_bold = this.props.element.hasOwnProperty("bold")
      ? this.props.element.bold
      : false;
    const this_checked_italic = this.props.element.hasOwnProperty("italic")
      ? this.props.element.italic
      : false;
    const this_checked_center = this.props.element.hasOwnProperty("center")
      ? this.props.element.center
      : false;
    const this_checked_page_break = this.props.element.hasOwnProperty("pageBreakBefore")
      ? this.props.element.pageBreakBefore
      : false;
    const this_checked_alternate_form = this.props.element.hasOwnProperty("alternateForm")
      ? this.props.element.alternateForm
      : false;

    const {
      canHavePageBreakBefore,
      canHaveAlternateForm,
      canHaveDisplayHorizontal,
      canHaveOptionCorrect,
      canHaveOptionValue,
    } = this.props.element;

    const this_files = this.props.files.length ? this.props.files : [];
    if (this_files.length < 1 || (this_files.length > 0 && this_files[0].id !== "")) {
      this_files.unshift({id: "", file_name: ""});
    }

    let editorState;
    if (this.props.element.hasOwnProperty("content")) {
      editorState = this.convertFromHTML(this.props.element.content);
    }
    if (this.props.element.hasOwnProperty("label")) {
      editorState = this.convertFromHTML(this.props.element.label);
    }

    return (
      <div>
        <div className="clearfix">
          <h4 className="pull-left">{this.props.element.text}</h4>

          <button
            className="pull-right btn btn-success"
            onClick={this.props.manualEditModeOff}
          >
            <i className="fa fa-floppy-o" />
            <span> Save</span>
          </button>
          {/* <button
            className="pull-right btn btn-danger p-paginator-right-content"
            onClick={this.props.cancelEditModeOff}
          >
            <i className="fa fa-ban" />
            <span> Cancel</span>
          </button> */}
        </div>
        {this.props.element.hasOwnProperty("content") && (
          <div className="form-group">
            <label className="control-label">Text to display:</label>

            <Editor
              toolbar={
                this.state.element.element === "Paragraph" ? toolbar : toolbarCamera
              } // NOTE: set only Paragraph element can implement html tags, to avoid view like web app component on mobile
              defaultEditorState={editorState}
              editorClassName={
                this.state.element.element === "Paragraph"
                  ? "editor-border"
                  : "editor-border-short"
              }
              onBlur={this.updateElement.bind(this)}
              onEditorStateChange={this.onEditorStateChange.bind(this, 0, "content")}
              stripPastedStyles={ false }
              handlePastedText={(text, html, editorState, onChange) => {
                // handling pasted html
                // it reorder map editorState with fragment content block array
                if (html) {
                  const contentBlock = htmlToDraft(html);
                  let contentState = editorState.getCurrentContent();
                  contentBlock.entityMap.forEach((value, key) => {
                    contentState = contentState.mergeEntityData(key, value);
                  });
                  contentState = Modifier.replaceWithFragment(
                    contentState,
                    editorState.getSelection(),
                    BlockMapBuilder.createFromArray(contentBlock.contentBlocks)
                  );
                  onChange(EditorState.push(editorState, contentState, "insert-characters"));
                  return true;
                }
                return false;
              }}
            />
          </div>
        )}
        {this.props.element.hasOwnProperty("file_path") && (
          <div className="form-group">
            <label className="control-label" htmlFor="fileSelect">
              Choose file:
            </label>
            <select
              id="fileSelect"
              className="form-control"
              defaultValue={this.props.element.file_path}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, "file_path", "value")}
            >
              {this_files.map(file => {
                const this_key = `file_${file.id}`;
                return (
                  <option value={file.id} key={this_key}>
                    {file.file_name}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        {this.props.element.hasOwnProperty("href") && (
          <div className="form-group">
            <TextAreaAutosize
              type="text"
              className="form-control"
              defaultValue={this.props.element.href}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, "href", "value")}
            />
          </div>
        )}
        {this.props.element.element === "Image" && this.props.element.hasOwnProperty("src") && (
          <div>
            {/** Currently disabled by style */}
            <div className="form-group">
              <label className="control-label" htmlFor="srcInput">
                Link to:
              </label>
              <input
                id="srcInput"
                type="text"
                className="form-control"
                defaultValue={this.props.element.src}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "src", "value")}
              />
            </div>

            {/** Image preview editor */}
            <div className="form-group image-upload-container">
              <div>
                <input
                  name={this.props.field_name}
                  type="file"
                  accept="image/*"
                  className="image-upload"
                  onChange={this.editImageProp.bind(this, "src", "value")}
                />
                <div className="image-upload-control">
                  <div className="btn btn-default btn-school">
                    <i className="fa fa-camera"></i>
                    {this.state.element["src"] !== "" ? " Change Image" : " Add Image"}
                  </div>
                  <p className="info-image-max">
                    Supported formats: JPG and PNG. Size max: 2 MB
                  </p>
                  {this.state.errorMessage && (
                    <p className="info-image-error">{this.state.errorMessage}</p>
                  )}
                </div>
              </div>
              {this.state.element["src"] !== "" && (
                <div className="form-column-direction" style={{marginTop: 20}}>
                  <div className="relative">
                    {this.renderImage(this.state.element["src"])}
                    <div
                      className="btn btn-school btn-image-clear"
                      onClick={this.clearImageProp.bind(this, "src", "value")}
                    >
                      <i className="fa fa-trash" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_checked_center}
                    value={true}
                    onChange={this.editElementProp.bind(this, "center", "checked")}
                  />
                  Center?
                </label>
              </div>
            </div>

            {/** Currently disabled by style */}
            <div className="row">
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementWidth">
                  Width:
                </label>
                <input
                  id="elementWidth"
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element.width}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, "width", "value")}
                />
              </div>
              {/** Currently disabled by style */}
              <div className="col-sm-3">
                <label className="control-label" htmlFor="elementHeight">
                  Height:
                </label>
                <input
                  id="elementHeight"
                  type="text"
                  className="form-control"
                  defaultValue={this.props.element.height}
                  onBlur={this.updateElement.bind(this)}
                  onChange={this.editElementProp.bind(this, "height", "value")}
                />
              </div>
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty("label") && (
          <div className="form-group">
            <label>Display Label</label>
            <TextAreaAutosize
              type="text"
              className="form-control"
              minRows={3}
              defaultValue={this.props.element.label}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, "label", "value")}
            />

            <br />
            {this.state.element.element !== "Table" && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_checked}
                    value={true}
                    onChange={this.editElementProp.bind(this, "required", "checked")}
                  />
                  Required
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty("readOnly") && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_read_only}
                    value={true}
                    onChange={this.editElementProp.bind(this, "readOnly", "checked")}
                  />
                  Read only
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty("defaultToday") && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_default_today}
                    value={true}
                    onChange={this.editElementProp.bind(this, "defaultToday", "checked")}
                  />
                  Default to Today?
                </label>
              </div>
            )}
            {this.props.element.hasOwnProperty("showTimeSelect") && (
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={this_show_time_select}
                    value={true}
                    onChange={this.editElementProp.bind(
                      this,
                      "showTimeSelect",
                      "checked"
                    )}
                  />
                  Show Time Select?
                </label>
              </div>
            )}
            {this_show_time_select &&
              this.props.element.hasOwnProperty("showTimeSelectOnly") && (
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={this_show_time_select_only}
                      value={true}
                      onChange={this.editElementProp.bind(
                        this,
                        "showTimeSelectOnly",
                        "checked"
                      )}
                    />
                    Show Time Select Only?
                  </label>
                </div>
              )}
            {(this.state.element.element === "RadioButtons" ||
              this.state.element.element === "Checkboxes") &&
              canHaveDisplayHorizontal && (
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={this_checked_inline}
                      value={true}
                      onChange={this.editElementProp.bind(this, "inline", "checked")}
                    />
                    Display horizonal
                  </label>
                </div>
              )}
          </div>
        )}

        {this.state.element.element === "Signature" && this.props.element.readOnly ? (
          <div className="form-group">
            <label className="control-label" htmlFor="variableKey">
              Variable Key:
            </label>
            <input
              id="variableKey"
              type="text"
              className="form-control"
              defaultValue={this.props.element.variableKey}
              onBlur={this.updateElement.bind(this)}
              onChange={this.editElementProp.bind(this, "variableKey", "value")}
            />
            <p className="help-block">
              This will give the element a key that can be used to replace the content
              with a runtime value.
            </p>
          </div>
        ) : (
          <div />
        )}

        {canHavePageBreakBefore && (
          <div className="form-group">
            <label className="control-label">Print Options</label>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked_page_break}
                  value={true}
                  onChange={this.editElementProp.bind(this, "pageBreakBefore", "checked")}
                />
                Page Break Before Element?
              </label>
            </div>
          </div>
        )}

        {canHaveAlternateForm && (
          <div className="form-group">
            <label className="control-label">Alternate/Signature Page</label>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked_alternate_form}
                  value={true}
                  onChange={this.editElementProp.bind(this, "alternateForm", "checked")}
                />
                Display on alternate/signature Page?
              </label>
            </div>
          </div>
        )}

        {this.props.element.hasOwnProperty("step") && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeStep">
                Step
              </label>
              <input
                id="rangeStep"
                type="number"
                className="form-control"
                defaultValue={this.props.element.step}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "step", "value")}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty("min_value") && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMin">
                Min
              </label>
              <input
                id="rangeMin"
                type="number"
                className="form-control"
                defaultValue={this.props.element.min_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "min_value", "value")}
              />
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.min_label}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "min_label", "value")}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty("max_value") && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="rangeMax">
                Max
              </label>
              <input
                id="rangeMax"
                type="number"
                className="form-control"
                defaultValue={this.props.element.max_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "max_value", "value")}
              />
              <input
                type="text"
                className="form-control"
                defaultValue={this.props.element.max_label}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "max_label", "value")}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty("default_value") && (
          <div className="form-group">
            <div className="form-group-range">
              <label className="control-label" htmlFor="defaultSelected">
                Default Selected
              </label>
              <input
                id="defaultSelected"
                type="number"
                className="form-control"
                defaultValue={this.props.element.default_value}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "default_value", "value")}
              />
            </div>
          </div>
        )}
        {this.props.element.hasOwnProperty("static") && this.props.element.static && (
          <div className="form-group">
            <label className="control-label">Text Style</label>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked_bold}
                  value={true}
                  onChange={this.editElementProp.bind(this, "bold", "checked")}
                />
                Bold
              </label>
            </div>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this_checked_italic}
                  value={true}
                  onChange={this.editElementProp.bind(this, "italic", "checked")}
                />
                Italic
              </label>
            </div>
          </div>
        )}
        {this.props.showCorrectColumn &&
          this.props.element.canHaveAnswer &&
          !this.props.element.hasOwnProperty("options") && (
            <div className="form-group">
              <label className="control-label" htmlFor="correctAnswer">
                Correct Answer
              </label>
              <input
                id="correctAnswer"
                type="text"
                className="form-control"
                defaultValue={this.props.element.correct}
                onBlur={this.updateElement.bind(this)}
                onChange={this.editElementProp.bind(this, "correct", "value")}
              />
            </div>
          )}
        {/* {this.props.element.hasOwnProperty('options') && (
          <div className="form-group">
            <label className="control-label" htmlFor="optionsApiUrl">
              Populate Options from API
            </label>
            <div className="row">
              <div className="col-sm-6">
                <input
                  className="form-control"
                  style={{width: '100%'}}
                  type="text"
                  id="optionsApiUrl"
                  placeholder="http://localhost:8080/api/optionsdata"
                />
              </div>
              <div className="col-sm-6">
                <button onClick={this.addOptions.bind(this)} className="btn btn-success">
                  Populate
                </button>
              </div>
            </div>
          </div>
        )} */}
        {this.props.element.hasOwnProperty("options") && (
          <DynamicOptionList
            showCorrectColumn={this.props.showCorrectColumn}
            canHaveOptionCorrect={canHaveOptionCorrect}
            canHaveOptionValue={canHaveOptionValue}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            key={this.props.element.options.length}
          />
        )}
        {this.props.element.hasOwnProperty("tableHeader") && (
          <DynamicTableSetting
            showCorrectColumn={this.props.showCorrectColumn}
            canHaveOptionCorrect={canHaveOptionCorrect}
            canHaveOptionValue={canHaveOptionValue}
            data={this.props.preview.state.data}
            updateElement={this.props.updateElement}
            preview={this.props.preview}
            element={this.props.element}
            header={this.props.element.tableHeader.length}
            content={this.props.element.tableContent.length}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    authAction: bindActionCreators(authActions, dispatch),
  };
};

// Default Props HOC
const withDefaultProps = defaultProps({
  className: "edit-element-fields",
});

export default connect(mapStateToProps, mapDispatchToProps)(withDefaultProps(FormElementsEdit));