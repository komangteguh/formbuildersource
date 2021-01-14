/**
 * <DynamicTableSetting />
 */

import React from "react";
import {Growl} from "primereact/growl";
import {Editor} from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import {ContentState, EditorState, convertToRaw, Modifier, BlockMapBuilder, convertFromHTML} from "draft-js";
import htmlToDraft from "html-to-draftjs";

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

export default class DynamicTableSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      element: props.element,
      data: props.data,
      dirty: false,
    };
  }

  editColumn(column, e) {
    const this_element = this.state.element;
    this_element.tableHeader[column].display = e.target.value;
    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  editHiddenColumn(column, e) {
    const this_element = this.state.element;
    if (this_element.tableHeader[column].hidden) {
      this_element.tableHeader[column].hidden = false;
    } else {
      this_element.tableHeader[column].hidden = true;
    }
    this.setState({
      element: this_element,
      dirty: true,
    });
  }
  editShowTitle(e) {
    const this_element = this.state.element;
    if (this_element.showTitle) {
      this_element.showTitle = false;
    } else {
      this_element.showTitle = true;
    }
    this.setState({
      element: this_element,
      dirty: true,
    });
  }
  editShowHeader(e) {
    const this_element = this.state.element;
    if (this_element.showHeader) {
      this_element.showHeader = false;
    } else {
      this_element.showHeader = true;
    }
    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  editRow(column, row, editorState) {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/<p>/g, '<div>').replace(/<\/p>/g, '</div>');
    const this_element = this.state.element;
    this_element.tableContent[column].value[row] = html;
    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  addColumn() {
    const this_element = this.state.element;
    this_element.columns = this_element.columns + 1;
    let newColumn = null;
    if (this_element.columns < 4 && this_element.columns > 1) {
      newColumn = {
        display: "Text Column " + this_element.columns,
        type: "label",
      };
    } else if (this_element.columns < 7 && this_element.columns > 3) {
      newColumn = {
        display: "Response Column " + (parseInt(this_element.columns) - 3).toString(),
        type: "radioButton",
      };
    } else {
      newColumn = {
        display: "Comments",
        type: "textArea",
      };
    }
    this_element.tableHeader.push(newColumn);
    this.setState({
      element: this_element,
      dirty: true,
    });
  }
  removeColumn(index, e) {
    const this_element = this.state.element;
    this_element.tableHeader.splice(index, 1);
    this_element.columns = this_element.columns - 1;
    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  addRow(rowIndex, e) {
    const this_element = this.state.element;
    if (this_element.rows < 50) {
      this_element.rows = this_element.rows + 1;
      let maxColumns = 7;
      let nextToCurrentRow = rowIndex + 1;
      for (let i = 0; i < maxColumns; i++) {
        if (i < 3) {
          this_element.tableContent[i].value.splice(
            nextToCurrentRow,
            0,
            "Caption for column " + (i + 1) + " questions will be put on here"
          );
        } else if (i === 6) {
          this_element.tableContent[i].value.splice(nextToCurrentRow, 0, ""); // set default value comments to empty string AS-782
        } else {
          this_element.tableContent[i].value.splice(nextToCurrentRow, 0, false);
        }
      }
      this.setState({
        element: this_element,
        dirty: true,
      });
    } else {
      this.growl.show({
        severity: "error",
        summary: "Cannot add more row",
        detail: "Maximum row number is exceeded",
      });
    }
  }
  removeRow(index, e) {
    const this_element = this.state.element;
    for (let i = 0; i < this_element.columns; i++) {
      this_element.tableContent[i].value.splice(index, 1);
    }
    this_element.rows = this_element.rows - 1;
    this.setState({
      element: this_element,
      dirty: true,
    });
  }

  updateOption() {
    const this_element = this.state.element;
    // to prevent ajax calls with no change
    if (this.state.dirty) {
      this.props.updateElement.call(this.props.preview, this_element);
      this.setState({dirty: false});
    }
  }

  columnRender(index) {
    return (
      <li className="clearfix">
        <div className="row">
          <div className="col-sm-6">
            <input
              className="form-control"
              style={{width: "100%"}}
              type="text"
              name={`columnNumber_` + index}
              id={`columnNumber_` + index}
              value={this.state.element.tableHeader[index].display}
              onBlur={this.updateOption.bind(this)}
              onChange={this.editColumn.bind(this, index)}
            />
          </div>
          <div className="col-sm-3">
            <input
              className="form-control"
              style={{width: "100%"}}
              type="checkbox"
              name={`columnNumber_` + index}
              id={`columnNumber_` + index}
              defaultChecked={this.state.element.tableHeader[index].hidden}
              onBlur={this.updateOption.bind(this)}
              onClick={this.editHiddenColumn.bind(this, index)}
            />
          </div>
          <div className="col-sm-3">
            {index === this.state.element.columns - 1 && (
              <div className="dynamic-options-actions-buttons">
                {index < 6 && (
                  <button onClick={this.addColumn.bind(this)} className="btn btn-success">
                    <i className="fa fa-plus-circle"></i>
                  </button>
                )}
                {index > 0 && index === this.state.element.columns - 1 && (
                  <button
                    onClick={this.removeColumn.bind(this, index)}
                    className="btn btn-danger"
                  >
                    <i className="fa fa-minus-circle"></i>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </li>
    );
  }

  generateColumnFields() {
    let columnFields = [];
    let columnFieldsDisplay = [];
    for (let i = 0; i < this.state.element.columns; i++) {
      const field = this.columnRender(i);
      columnFields.push(field);
    }
    columnFieldsDisplay.push(<ul>{columnFields}</ul>);
    return columnFieldsDisplay;
  }

  rowTextRender(rowIndex, columnIndex) {
    return (
      <div className="col-sm-9 p-b-10">
        <Editor
          toolbar={toolbar}
          defaultEditorState={this.convertFromHTML(
            this.state.element.tableContent[columnIndex].value[rowIndex]
          )}
          editorClassName={"editor-border"}
          onBlur={this.updateOption.bind(this)}
          onEditorStateChange={this.editRow.bind(this, columnIndex, rowIndex)}
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
    );
  }

  convertFromHTML(content) {
    const contentBlock = htmlToDraft(content);
    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
    return EditorState.createWithContent(contentState);
  }

  rowTitleRender(rowIndex) {
    return (
      <div>
        {/* render row number on the first place of the row's fields */}
        <div>
          <p>
            <b>Row {rowIndex + 1}</b>
          </p>
        </div>
      </div>
    );
  }

  rowAddingRender(rowIndex) {
    return (
      <div className="col-sm-3 p-v-l">
        <div className="dynamic-options-actions-buttons">
          <button onClick={this.addRow.bind(this, rowIndex)} className="btn btn-success">
            <i className="fa fa-plus-circle"></i>
          </button>
          {rowIndex > 0 && (
            <button
              onClick={this.removeRow.bind(this, rowIndex)}
              className="btn btn-danger"
            >
              <i className="fa fa-minus-circle"></i>
            </button>
          )}
        </div>
      </div>
    );
  }

  generateRowFields() {
    let contentRow = [];
    for (let i = 0; i < this.state.element.rows; i++) {
      let rowTitle = this.rowTitleRender(i);
      let rowAdding = this.rowAddingRender(i);
      let rowText = [];
      for (let j = 0; j < this.state.element.columns; j++) {
        const value = this.state.element.tableContent[j] ? this.state.element.tableContent[j].value[i] : null;
        if (j < 3 && typeof value !== "boolean") {
          const rowTextTemp = this.rowTextRender(i, j);
          rowText.push(rowTextTemp);
        }
      }
      contentRow.push(
        <ul>
          <li className="clearfix" key={i + 1}>
            {rowTitle}
            <div className="row">
              {rowText}
              {rowAdding}
            </div>
          </li>
        </ul>
      );
    }
    return contentRow;
  }

  render() {
    if (this.state.dirty) {
      this.state.element.dirty = true;
    }
    return (
      <div className="dynamic-option-list">
        <Growl ref={el => (this.growl = el)} />
        <ul>
          <li>
            <div className="row">
              <div className="col-sm-12">
                <b>Title & Header</b>
              </div>
            </div>
          </li>
          <li>
            <div className="row">
              <div className="col-sm-1">
                <input
                  className="form-control"
                  type="checkbox"
                  name={`showTitle`}
                  id={`showTitle`}
                  value="Show Title"
                  defaultChecked={this.state.element.showTitle}
                  onBlur={this.updateOption.bind(this)}
                  onClick={this.editShowTitle.bind(this)}
                />
              </div>
              <div className="col-sm-11">
                <label htmlFor="showTitle"> Show Title</label>
              </div>
            </div>
          </li>
          <li>
            <div className="row">
              <div className="col-sm-1">
                <input
                  className="form-control"
                  type="checkbox"
                  name={`showHeader`}
                  id={`showHeader`}
                  value="Show Header"
                  defaultChecked={this.state.element.showHeader}
                  onBlur={this.updateOption.bind(this)}
                  onClick={this.editShowHeader.bind(this)}
                />
              </div>
              <div className="col-sm-11">
                <label htmlFor="showTitle"> Show Header</label>
              </div>
            </div>
          </li>
          <li>
            <div className="row">
              <div className="col-sm-8">
                <b>Table Settings</b>
              </div>
              <div className="col-sm-4">
                <b>Hide</b>
              </div>
            </div>
          </li>
          <li>
            <div className="row">
              <div className="col-sm-2">Column:</div>
              <div className="col-sm-10">{this.generateColumnFields()}</div>
            </div>
            <hr />
          </li>
          <li>
            <div className="row">
              <div className="col-sm-2">Row:</div>
              <div className="col-sm-10">{this.generateRowFields()}</div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
}
