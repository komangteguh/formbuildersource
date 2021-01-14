// eslint-disable-next-line max-classes-per-file

import * as formActions from "../../../store/actions/formBuilderAction";

import { format, parse } from "date-fns";

import { Growl } from "primereact/growl";
import HeaderBar from "./header-bar";
import ID from "./UUID";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import React from "react";
import ReactBootstrapSlider from "react-bootstrap-slider";
import ReactDatePicker from "react-datepicker";
import Select from "react-select";
import SignaturePad from "react-signature-canvas";
import StarRating from "./star-rating";
import { bindActionCreators } from "redux";
import cameraIcon from "./../../../images/camera_icon.png";
import { connect } from "react-redux";
import store from "../../../store/store";
import xss from "xss";

// import moment from 'moment';









const FormElements = {};
const myxss = new xss.FilterXSS({
  whiteList: {
    u: [],
    br: [],
    b: [],
    i: [],
    a: ["href", "target"],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    blockquote: [],
    pre: [],
    ins: [],
    ol: ["style"],
    ul: ["style"],
    li: [],
    p: ["style"],
    sub: [],
    sup: [],
    div: ["style"],
    em: [],
    strong: [],
    span: ["style"],
  },
});

const ComponentLabel = props => {
  const hasRequiredLabel =
    props.data.hasOwnProperty("required") &&
    props.data.required === true &&
    !props.read_only;

  return (
    <label className={props.className || "form-flex-1"}>
      <span dangerouslySetInnerHTML={{__html: myxss.process(props.data.label)}} />
      {hasRequiredLabel && (
        <span>
          <i className="fa fa-asterisk icon-red" />
        </span>
      )}
    </label>
  );
};

const ComponentHeader = props => {
  if (props.mutable) {
    return null;
  }
  return (
    <div>
      {props.data.pageBreakBefore && <div className="preview-page-break">Page Break</div>}
      <HeaderBar
        parent={props.parent}
        editModeOn={props.editModeOn}
        data={props.data}
        onDestroy={props._onDestroy}
        onEdit={props.onEdit}
        static={props.data.static}
        required={props.data.required}
        onMoveUp={props.onMoveUp}
        onMoveDown={props.onMoveDown}
      />
    </div>
  );
};

class Header extends React.Component {
  render() {
    // const headerClasses = `dynamic-input ${this.props.data.element}-input`;
    let classNames = "static";
    if (this.props.data.bold) {
      classNames += " bold";
    }
    if (this.props.data.italic) {
      classNames += " italic";
    }

    let baseClasses = "SortableItem rfb-item form-header-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <h3
          className={classNames}
          dangerouslySetInnerHTML={{__html: myxss.process(this.props.data.content)}}
        />
      </div>
    );
  }
}

class Paragraph extends React.Component {
  render() {
    let classNames = "static";
    if (this.props.data.bold) {
      classNames += " bold";
    }
    if (this.props.data.italic) {
      classNames += " italic";
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <p
          className={classNames}
          dangerouslySetInnerHTML={{__html: myxss.process(this.props.data.content)}}
        />
      </div>
    );
  }
}

class Label extends React.Component {
  render() {
    let classNames = "static";
    if (this.props.data.bold) {
      classNames += " bold";
    }
    if (this.props.data.italic) {
      classNames += " italic";
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <label
          className={classNames}
          dangerouslySetInnerHTML={{__html: myxss.process(this.props.data.content)}}
        />
      </div>
    );
  }
}

class LineBreak extends React.Component {
  render() {
    let baseClasses = "SortableItem rfb-item form-no-padding form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses} style={{height: "8px"}}>
        <div style={{top: "2px", position: "relative"}}>
          <ComponentHeader {...this.props} />
        </div>
        <hr className="f-m-5" />
      </div>
    );
  }
}

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = "text";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    if (this.props.read_only) {
      props.disabled = "disabled";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class NumberInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.type = "number";
    props.className = "form-control";
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    if (this.props.read_only) {
      props.disabled = "disabled";
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <input {...props} />
        </div>
      </div>
    );
  }
}

class TextArea extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.className = "form-control";
    props.name = this.props.data.field_name;

    if (this.props.read_only) {
      props.disabled = "disabled";
    }

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <textarea {...props} />
        </div>
      </div>
    );
  }
}

class DatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();

    this.updateFormat(props);
    this.state = this.updateDateTime(props, this.formatMask);
  }

  formatMask = "";

  handleChange = dt => {
    let placeholder;
    if (dt && dt.target) {
      placeholder =
        dt && dt.target && dt.target.value === "" ? this.formatMask.toLowerCase() : "";
      const formattedDate = dt.target.value
        ? format(dt.target.value, this.formatMask)
        : "";
      this.setState({
        value: formattedDate,
        internalValue: formattedDate,
        placeholder,
      });
    } else {
      this.setState({
        value: dt ? format(dt, this.formatMask) : "",
        internalValue: dt,
        placeholder,
      });
    }
  };

  updateFormat(props) {
    const {showTimeSelect, showTimeSelectOnly} = props.data;
    const dateFormat = showTimeSelect && showTimeSelectOnly ? "" : props.data.dateFormat;
    const timeFormat = showTimeSelect ? props.data.timeFormat : "";
    const formatMask = `${dateFormat} ${timeFormat}`.trim();
    const updated = formatMask !== this.formatMask;
    this.formatMask = formatMask;
    return updated;
  }

  updateDateTime(props, formatMask) {
    let value;
    let internalValue;
    const { defaultToday } = props.data;
    
    if (defaultToday && (props.defaultValue === "" || props.defaultValue === undefined)) {
      value = format(new Date(), formatMask);
      internalValue = new Date();
    } else {
      if (this.props.read_only) {
        value = format(new Date(props.data.value), formatMask);
      } else {
        value = props.defaultValue;
        if (value === "" || value === undefined) {
          internalValue = undefined;
        } else {
          internalValue = parse(value, this.formatMask, new Date());
        }
      }
    }
    
    return {
      value,
      internalValue,
      placeholder: formatMask.toLowerCase(),
      defaultToday,
    };
  }

  componentWillReceiveProps(props) {
    const formatUpdated = this.updateFormat(props);
    if (props.data.defaultToday !== !this.state.defaultToday || formatUpdated) {
      const state = this.updateDateTime(props, this.formatMask);
      this.setState(state);
    }  
  }

  render() {
    const {showTimeSelect, showTimeSelectOnly} = this.props.data;
    const props = {};
    props.type = "date";
    props.className = "form-control";
    props.name = this.props.data.field_name;
    const readOnly = this.props.data.readOnly || this.props.read_only;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const placeholderText = this.formatMask.toLowerCase();

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group form-flex form-group-clear">
          <ComponentLabel {...this.props} />
          <div className="form-row-direction form-flex-0-end">
            {readOnly && (
              <div className="form-date-detail">
                <label className="form-flex">
                  {this.state.value ? `${this.state.value} ` : "- "}
                  <i className="pi pi-calendar" />
                </label>
              </div>
            )}
            {iOS && !readOnly && (
              <input
                type="date"
                name={props.name}
                ref={props.ref}
                onChange={this.handleChange}
                dateFormat="MM/DD/YYYY"
                placeholder={this.state.placeholder}
                value={this.state.value}
                className="form-control form-flex-end"
              />
            )}
            {!iOS && !readOnly && (
              <ReactDatePicker
                name={props.name}
                ref={props.ref}
                onChange={this.handleChange}
                selected={this.state.internalValue}
                todayButton={"Today"}
                className="form-control form-flex-end"
                isClearable={true}
                showTimeSelect={showTimeSelect}
                showTimeSelectOnly={showTimeSelectOnly}
                dateFormat={this.formatMask}
                placeholderText={placeholderText}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.className = "form-control form-flex-end";
    props.name = this.props.data.field_name;
    let listOptions = this.props.data.options;
    const isValueExist = this.props.data.options.filter(
      option => option.value === this.props.defaultValue
    );

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
      if (isValueExist.length === 0) {
        listOptions = this.props.data.options.concat({
          value: "",
          text: "",
          key: ID.uuid(),
        });
      }
    }

    if (this.props.read_only) {
      props.disabled = "disabled";
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group form-flex">
          <ComponentLabel {...this.props} />
          <select {...props}>
            {listOptions.map(option => {
              const this_key = `preview_${option.key}`;
              return (
                <option value={option.value} key={this_key}>
                  {option.text}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }
}

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      option: [],
      textVal: [],
      radioButtonVal: [],
      selectedOption: [],
    };
    this.textAreaChanges = this.textAreaChanges.bind(this);
    this.radioButtonChanges = this.radioButtonChanges.bind(this);
  }

  textAreaChanges(e, index) {
    let {textVal} = this.state;
    textVal[index] = e.target.value;
    this.setState({textVal});
  }

  radioButtonChanges(e, index) {
    let {selectedOption} = this.state;
    selectedOption[index] = e.target.value;
    this.setState({selectedOption});
  }

  createTable() {
    let table = [];
    let headerColumn = [];
    let headerColumnRow = [];
    let rows = [];
    let uniqueId = ID.uuid();
    let {textVal, radioButtonVal} = this.state;
    const colStyle = {
      padding: "8px",
      verticalAlign: "top",
      borderTop: "1px solid #ddd",
    };
    for (let i = 0; i < this.props.data.columns; i++) {
      if (this.props.data.tableHeader[i]) {
        if (!this.props.data.tableHeader[i].hidden) {
          headerColumnRow.push(
            <td
              key={`${i}_${new Date().toLocaleTimeString()}`}
              style={{
                padding: "8px",
                borderTop: "1px solid #ddd",
                borderRight: "1px solid #ddd",
              }}
            >
              <b>{this.props.data.tableHeader[i].display}</b>
            </td>
          );
        }
      }
    }
    headerColumn.push(
      <tr key={`${uniqueId}_${new Date().toLocaleTimeString()}`}>{headerColumnRow}</tr>
    );
    let radioBtnCtr = 0;
    for (let i = 0; i < this.props.data.rows; i++) {
      let contentRow = [];
      for (let j = 0; j < this.props.data.columns; j++) {
        let content = null;
        if (this.props.data.tableHeader[j]) {
          if (!this.props.data.tableHeader[j].hidden) {
            //differentiate between label, textarea and radiobuttons
            if (this.props.data.tableContent[j]) {
              if (this.props.data.tableContent[j].type.toLowerCase() === "radiobutton") {
                radioButtonVal.push(uniqueId + `_response_` + j + i);

                content = (
                  <input
                    type="radio"
                    id={radioButtonVal[radioBtnCtr]}
                    name={uniqueId + `_response_row_` + i}
                    checked={this.props.data.tableContent[j].value[i]}
                    disabled={true}
                    value={this.props.data.tableContent[j].value[i]}
                  />
                );
              } else if (this.props.data.tableContent[j].type.toLowerCase() === "textarea") {
                let txtAreaHeight = this.props.data.tableContent[j].value[i]
                  ? this.props.data.tableContent[j].value[i].length + 100
                  : 100;
                textVal.push(this.props.data.tableContent[j].value[i]);
                content = (
                  <textarea
                    id={`_response_` + j + i}
                    name={`_response_row_` + i}
                    value={textVal[i]}
                    style={{
                      wordBreak: "break-all",
                      overflowY: "hidden",
                      height: txtAreaHeight + "px",
                      boxSizing: "border-box",
                    }}
                    disabled={true}
                    onChange={e => this.textAreaChanges(e, i)}
                  ></textarea>
                );
              } else {
                content = (
                  <span
                    style={{ whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html: myxss.process(this.props.data.tableContent[j].value[i]),
                    }}
                  />
                );
              }
            } else {
              if (this.props.data.tableHeader[j].type.toLowerCase() === "radiobutton") {
                radioButtonVal.push(uniqueId + `_response_` + j + i);

                content = (
                  <input
                    type="radio"
                    id={radioButtonVal[radioBtnCtr]}
                    name={uniqueId + `_response_row_` + i}
                    checked={false}
                    disabled={true}
                    value={false}
                  />
                );
              } else if (this.props.data.tableHeader[j].type.toLowerCase() === "textarea") {
                let txtAreaHeight = 100;
                textVal.push("");
                content = (
                  <textarea
                    id={`_response_` + j + i}
                    name={`_response_row_` + i}
                    value={textVal[i]}
                    style={{
                      wordBreak: "break-all",
                      overflowY: "hidden",
                      height: txtAreaHeight + "px",
                      boxSizing: "border-box",
                    }}
                    disabled={true}
                    onChange={e => this.textAreaChanges(e, i)}
                  ></textarea>
                );
              } else {
                content = (
                  <span
                    style={{ whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html: myxss.process(""),
                    }}
                  />
                );
              }
            }

            //set column styling
            if (j < 3) {
              //check if it is the text column
              contentRow.push(
                <td key={`${j}_${new Date().toLocaleTimeString()}`} style={colStyle}>
                  {content}
                  {j === 0 && (
                    <span>
                      {" "}
                      <i className="fa fa-asterisk icon-red" />
                    </span>
                  )}
                </td>
              );
            } else {
              contentRow.push(
                <td
                  key={`${j}_${new Date().toLocaleTimeString()}`}
                  style={{textAlign: "center"}}
                >
                  {content}
                </td>
              );
            }
          }
        }
      }
      rows.push(
        <tr
          key={`${i}_${new Date().toLocaleTimeString()}`}
          style={{pageBreakInside: "avoid", pageBreakAfter: "auto"}}
        >
          {contentRow}
        </tr>
      );
    }

    table.push(
      <table
        key={`${uniqueId}_${new Date().toLocaleTimeString()}`}
        name={this.props.data.field_name}
        className="table table-bordered"
        style={{pageBreakInside: "auto"}}
      >
        {/* use div to fix some values on column failed to avoid page break */}
        <div style={{display: "table-header-group"}}>
          {this.props.data.showTitle && (
            <tr>
              <td colSpan={this.props.data.columns} style={colStyle}>
                <ComponentLabel {...this.props} />
              </td>
            </tr>
          )}
          {this.props.data.showHeader && headerColumn}
        </div>
        <tbody>{rows}</tbody>
      </table>
    );
    return table;
  }

  render() {
    const props = {};

    if (this.props.mutable) {
      props.defaultValue = this.props.defaultValue;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item form-border-bottom form-no-padding";
    return (
      <div className={baseClasses}>
        <div style={{top: "8px", position: "relative"}}>
          <ComponentHeader {...this.props} />
        </div>
        <div className="SortableItem rfb-item form-label-el">
          {this.props && this.createTable()}
        </div>
      </div>
    );
  }
}

class Signature extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultValue: props.defaultValue,
      imageLoaded: true
    };
    this.inputField = React.createRef();
    this.canvas = React.createRef();
  }

  componentDidMount() {
    const token = this.props.token;
    const baseUrl = process.env.REACT_APP_ASSESSMENT_ENDPOINT;

    let defaultValue = this.state.defaultValue;

    if (defaultValue && defaultValue.toLowerCase().includes("/assessment")) {
      this.setState({ imageLoaded: false });
      let imageUrl = baseUrl + defaultValue;
      fetch(imageUrl, {
        method: "GET",
        headers: { Authorization: 'Bearer ' + token }
      }).then(response => response.json())
        .then(data => {
          this.setState({ defaultValue: data, imageLoaded: true });
        });
    }
  }

  clear = () => {
    if (this.state.defaultValue) {
      this.setState({ defaultValue: "" });
    } else if (this.canvas.current) {
      this.canvas.current.clear();
    }
  };

  render() {
    const { defaultValue } = this.state;
    let canClear = !!defaultValue;
    const props = {};
    props.type = "hidden";
    props.name = this.props.data.field_name;

    if (this.props.mutable) {
      props.defaultValue = defaultValue;
      props.ref = this.inputField;
    }
    const pad_props = {};
    // umd requires canvasProps={{ width: 400, height: 150 }}
    if (this.props.mutable) {
      pad_props.defaultValue = defaultValue;
      pad_props.ref = this.canvas;
      canClear = !this.props.read_only;
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    let sourceDataURL;
    if (defaultValue && defaultValue.length > 0) {
      if (defaultValue.includes("data:image/")) {
        sourceDataURL = `${defaultValue}`;
      } else {
        sourceDataURL = `data:image/png;base64,${defaultValue}`;
      }
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group form-flex">
          <ComponentLabel {...this.props} />
          {this.props.read_only === true || !!sourceDataURL ? (
            this.state.imageLoaded ?
              <img
                src={sourceDataURL}
                className={
                  sourceDataURL
                    ? "form-flex-end form-signature-img"
                    : "form-flex-end form-signature-img-empty"
                }
              /> :
              <div style={{ width: "50px" }}>
                <LoadingSpinner ></LoadingSpinner>
              </div>
          ) : (
              <SignaturePad {...pad_props} />
            )}
          {canClear && (
            <i
              className="fa fa-times clear-signature"
              onClick={this.clear}
              title="Clear Signature"
            ></i>
          )}
          <input {...props} />
        </div>
      </div>
    );
  }
}

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    const {defaultValue, data} = props;
    this.state = {value: this.getDefaultValue(defaultValue, data.options)};
  }

  getDefaultValue(defaultValue, options) {
    if (defaultValue) {
      if (typeof defaultValue === "string") {
        const vals = defaultValue.split(",").map(x => x.trim());
        return options.filter(x => vals.indexOf(x.value) > -1);
      }
      return options.filter(x => defaultValue.indexOf(x.value) > -1);
    }
    return [];
  }

  // state = { value: this.props.defaultValue !== undefined ? this.props.defaultValue.split(',') : [] };

  handleChange = e => {
    this.setState({value: e});
  };

  render() {
    const options = this.props.data.options.map(option => {
      option.label = option.text;
      return option;
    });
    const props = {};
    props.isMulti = true;
    props.name = this.props.data.field_name;
    props.onChange = this.handleChange;

    props.options = options;
    if (!this.props.mutable) {
      props.value = options[0].text;
    } // to show a sample of what tags looks like
    if (this.props.mutable) {
      props.isDisabled = this.props.read_only;
      props.value = this.state.value;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <Select {...props} />
        </div>
      </div>
    );
  }
}

class Checkboxes extends React.Component {
  constructor(props) {
    super(props);
    this.options = {};
  }

  render() {
    const self = this;
    let classNames = "checkbox-label form-checkbox-option";
    // if (this.props.data.inline) {
    //   classNames += ' option-inline';
    // }

    let baseClasses = "SortableItem rfb-item form-border-bottom form-no-padding";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <div style={{top: "8px", position: "relative"}}>
          <ComponentHeader {...this.props} />
        </div>
        <div className="form-group form-flex form-group-clear">
          <ComponentLabel className="form-label form-checkbox-label" {...this.props} />
          <div className="form-checkbox-container">
            {this.props.data.options.map(option => {
              const this_key = `preview_${option.key}`;
              const props = {};
              props.name = `option_${option.key}`;

              props.type = "checkbox";
              props.value = option.value;
              if (self.props.mutable) {
                props.defaultChecked =
                  self.props.defaultValue !== undefined &&
                  (self.props.defaultValue.indexOf(option.key) > -1 ||
                    self.props.defaultValue.indexOf(option.value) > -1);
              }
              if (this.props.read_only) {
                props.disabled = "disabled";
              }
              return (
                <div className={classNames} key={this_key}>
                  <label className="form-flex-start">{option.text} </label>

                  <div className="form-flex-0-end">
                    <input
                      ref={c => {
                        if (c && self.props.mutable) {
                          self.options[`child_ref_${option.key}`] = c;
                        }
                      }}
                      {...props}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

class RadioButtons extends React.Component {
  constructor(props) {
    super(props);
    this.options = {};
  }

  render() {
    const self = this;
    let classNames = "radio-label form-checkbox-option";
    // if (this.props.data.inline) {
    //   classNames += ' option-inline';
    // }

    let baseClasses = "SortableItem rfb-item form-border-bottom form-no-padding";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <div style={{top: "8px", position: "relative"}}>
          <ComponentHeader {...this.props} />
        </div>
        <div className="form-group form-flex form-group-clear">
          <ComponentLabel className="form-label form-checkbox-label" {...this.props} />
          <div className="form-checkbox-container">
            {this.props.data.options.map(option => {
              const this_key = `preview_${option.key}`;
              const props = {};
              props.name = self.props.data.field_name;

              props.type = "radio";
              props.value = option.value;
              if (self.props.mutable) {
                props.defaultChecked =
                  self.props.defaultValue !== undefined &&
                  (self.props.defaultValue.indexOf(option.key) > -1 ||
                    self.props.defaultValue.indexOf(option.value) > -1);
              }
              if (this.props.read_only) {
                props.disabled = "disabled";
              }

              return (
                <div className={classNames} key={this_key}>
                  <label className="form-flex-start">{option.text} </label>

                  <div className="form-flex-0-end">
                    <input
                      ref={c => {
                        if (c && self.props.mutable) {
                          self.options[`child_ref_${option.key}`] = c;
                        }
                      }}
                      {...props}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: this.props.data.src,
      isFormImage: false,
      imageLoaded: true,
      formUploadImageStatusFound: false,
      formUploadImageStatusUploading: false,
      formUploadImageStatusSuccess: false,
    };
  }

  componentDidMount() {
    const token = this.props.token;
    const baseAssessmentUrl = process.env.REACT_APP_ASSESSMENT_ENDPOINT;
    const baseFormUrl = process.env.REACT_APP_FORM_ENDPOINT;

    let src = this.state.src;
    let imageUrl = "";

    if (src && src.toLowerCase().includes("/assessment")) {
      this.setState({ imageLoaded: false });
      imageUrl = baseAssessmentUrl + src;
      fetch(imageUrl, {
        method: "GET",
        headers: { Authorization: 'Bearer ' + token }
      }).then(response => response.json())
        .then(data => {
          this.setState({ src: data, imageLoaded: true });
        });
    }

    if (src && src.toLowerCase().includes("/form")) {
      this.setState({ isFormImage: true });
      let formUploadImageStatusFound = false;
      let formUploadImageStatusUploading = false;
      let formUploadImageStatusSuccess = false;

      if (this.props.data.formId) {
        const uploadStatus = this.props.uploadingImages && this.props.uploadingImages.find(it => it.formId == this.props.data.formId && it.formDataId == this.props.data.id);
        if (uploadStatus) {
          formUploadImageStatusFound = true;
          formUploadImageStatusUploading = uploadStatus.isUploading;
          formUploadImageStatusSuccess = uploadStatus.success;
        }
      }

      this.setState({
        formUploadImageStatusFound: formUploadImageStatusFound,
        formUploadImageStatusUploading: formUploadImageStatusUploading,
        formUploadImageStatusSuccess: formUploadImageStatusSuccess,
      });

      if (!formUploadImageStatusFound) {
        this.setState({ imageLoaded: false });
        imageUrl = baseFormUrl + src;
        fetch(imageUrl, {
          method: "GET",
          headers: { Authorization: 'Bearer ' + token }
        }).then(response => response.json())
          .then(data => {
            this.setState({ src: data, imageLoaded: true });
          });
      } else {
        if (formUploadImageStatusFound && !formUploadImageStatusUploading) {
          let src = this.state.src;
          let imageUrl = "";
          if (src && src.toLowerCase().includes("/form")) {
            this.setState({ imageLoaded: false });
            imageUrl = baseFormUrl + src;
            fetch(imageUrl, {
              method: "GET",
              headers: { Authorization: 'Bearer ' + token }
            }).then(response => response.json())
              .then(data => {
                this.setState({ src: data, imageLoaded: true });
              });

            this.props.formActions.doUploadFormImageClear(this.props.data.formId, this.props.data.id);
          }
        } else {
          this.setState({ imageLoaded: false });
        }
      }
    }
  };

  componentDidUpdate(prevprops, prevState) {
    if (
      prevprops.uploadingImages !== this.props.uploadingImages
    ) {
      if (this.state.isFormImage && this.state.formUploadImageStatusFound && this.state.formUploadImageStatusUploading) {
        const token = this.props.token;
        const baseFormUrl = process.env.REACT_APP_FORM_ENDPOINT;

        let formUploadImageStatusFound = false;
        let formUploadImageStatusUploading = false;
        let formUploadImageStatusSuccess = false;

        const uploadStatus = this.props.uploadingImages && this.props.uploadingImages.find(it => it.formId == this.props.data.formId && it.formDataId == this.props.data.id);
        if (uploadStatus) {
          formUploadImageStatusFound = true;
          formUploadImageStatusUploading = uploadStatus.isUploading;
          formUploadImageStatusSuccess = uploadStatus.success;
        }

        this.setState({
          formUploadImageStatusFound: formUploadImageStatusFound,
          formUploadImageStatusUploading: formUploadImageStatusUploading,
          formUploadImageStatusSuccess: formUploadImageStatusSuccess,
        });

        if (formUploadImageStatusFound && !formUploadImageStatusUploading) {
          let src = this.state.src;
          let imageUrl = "";
          if (src && src.toLowerCase().includes("/form")) {
            this.setState({ imageLoaded: false });
            imageUrl = baseFormUrl + src;
            fetch(imageUrl, {
              method: "GET",
              headers: { Authorization: 'Bearer ' + token }
            }).then(response => response.json())
              .then(data => {
                this.setState({ src: data, imageLoaded: true });
              });

            this.props.formActions.doUploadFormImageClear(this.props.data.formId, this.props.data.id);
          }
        }
      }
    }
  }

  render() {
    const style = this.props.data.center ? { textAlign: "center" } : null;

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses} style={style}>
        {!this.props.mutable && (
          <HeaderBar
            parent={this.props.parent}
            editModeOn={this.props.editModeOn}
            data={this.props.data}
            onDestroy={this.props._onDestroy}
            onEdit={this.props.onEdit}
            required={this.props.data.required}
            onMoveUp={this.props.onMoveUp}
            onMoveDown={this.props.onMoveDown}
          />
        )}
        {this.props.data.src && (
          this.state.imageLoaded ?
            <div>
              <img
                src={this.props.data.src && this.props.data.src.startsWith("data:image/") ? this.props.data.src : this.state.src}
                alt={this.props.data.label}
                className="form-img"
                width={this.props.data.width}
                height={this.props.data.height}
              />
            </div>
            :
            <div style={{ width: "50px" }}>
              <LoadingSpinner ></LoadingSpinner>
            </div>
        )}
        {!this.props.data.src && <div className="no-image">No Image</div>}
      </div>
    );
  }
}

class Rating extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
  }

  render() {
    const props = {};
    props.name = this.props.data.field_name;
    props.ratingAmount = 5;

    if (this.props.mutable) {
      props.rating =
        this.props.defaultValue !== undefined
          ? parseFloat(this.props.defaultValue, 10)
          : 0;
      props.editing = true;
      props.disabled = this.props.read_only;
      props.ref = this.inputField;
    }

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          <StarRating {...props} />
        </div>
      </div>
    );
  }
}

class HyperLink extends React.Component {
  render() {
    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <a target="_blank" href={this.props.data.href}>
            {this.props.data.content}
          </a>
        </div>
      </div>
    );
  }
}

class Download extends React.Component {
  render() {
    let baseClasses = "SortableItem rfb-item";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <a href={`${this.props.download_path}?id=${this.props.data.file_path}`}>
            {this.props.data.content}
          </a>
        </div>
      </div>
    );
  }
}

class Camera extends React.Component {
  constructor(props) {
    super(props);
    this.state = { img: [], images: [] };
    this.renderImage = this.renderImage.bind(this);
  }

  componentDidMount() {
    const token = this.props.token;
    const baseUrl = process.env.REACT_APP_ASSESSMENT_ENDPOINT;

    const imageList = this.props.defaultValue;
    let images = imageList && imageList.map(image => {
      return {
        url: image,
        image: null,
        loaded: false
      }
    });

    this.setState({ images });

    if (images) {
      images.forEach(async image => {
        let imageUrl = image.url;
        if (imageUrl && imageUrl != "") {
          if (imageUrl.includes('data:image')) {
            image.image = imageUrl;
            this.setState({ images });
          } else {
            imageUrl = baseUrl + imageUrl;

            fetch(imageUrl, {
              method: "GET",
              headers: { Authorization: 'Bearer ' + token }
            }).then(response => response.json())
              .then(data => {
                image.image = data;
                image.loaded = true;
                this.setState({ images });
              });
          }
        }
      });
    }
  }

  displayImage = e => {
    const self = this;
    const target = e.target;
    let file;
    let reader;
    const imageList = self.state.img.map(item => item);

    if (target.files && target.files.length) {
      file = target.files[0];
      // eslint-disable-next-line no-undef
      reader = new FileReader();
      reader.readAsDataURL(file);
      if (!file.type.includes("image")) {
        this.growl.show({
          severity: "error",
          summary: "Error",
          detail: `File type is not supported`,
        });
      } else {
        reader.onloadend = () => {
          imageList.push(reader.result);
          self.setState({
            img: imageList,
          });
        };
      }
    }
  };

  clearImage = imageId => {
    const imageList = this.state.img.map(item => item);
    const updateList = imageList.filter((item, id) => imageId !== id);
    this.setState({
      img: updateList,
    });
  };

  renderImage(image) {
    if (image.loaded) {
      return (
        <img src={image.image} className={"form-flex-0 m-10"} />
      );
    } else {
      return (
        <div style={{ width: "50px" }}>
          <LoadingSpinner ></LoadingSpinner>
        </div>
      );
    }
  }

  render() {
    let baseClasses = "SortableItem rfb-item form-label-el";
    const name = this.props.data.field_name;
    const fileInputStyle = this.state.img.length >= 10 ? { display: "none" } : null;
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }
    let sourceDataURL;
    if (
      this.props.read_only &&
      (this.props.defaultValue || this.props.defaultValue === "")
    ) {
      if (this.props.defaultValue.indexOf(name > -1)) {
        sourceDataURL =
          this.props.defaultValue === "" ? cameraIcon : this.props.defaultValue;
      } else {
        sourceDataURL = `data:image/png;base64,${this.props.defaultValue}`;
      }
    }
    return (
      <div className={baseClasses}>
        <Growl ref={el => (this.growl = el)} />
        <ComponentHeader {...this.props} />
        <div className="form-group form-column-direction">
          <ComponentLabel {...this.props} />
          {this.props.read_only &&
            (this.props.defaultValue || this.props.defaultValue === "") ? (
              typeof this.props.defaultValue === "string" ? (
                <div className="form-column-direction">
                  <img
                    src={sourceDataURL}
                    className={
                      this.props.defaultValue === ""
                        ? "form-flex-0 form-signature-img-camera-empty"
                        : "form-flex-0 form-signature-img-camera"
                    }
                  />
                </div>
              ) : (
                  <div className="form-column-direction">
                    {this.state.images.map(item => (
                      this.renderImage(item)
                    ))}
                  </div>
                )
            ) : (
              <div className="image-upload-container">
                <div style={fileInputStyle}>
                  <input
                    name={name}
                    type="file"
                    accept="image/*"
                    capture="camera"
                    className="image-upload"
                    onChange={this.displayImage}
                  />
                  <div className="image-upload-control">
                    <div className="btn btn-default btn-school">
                      <i className="fa fa-camera"></i> Add Photos
                  </div>
                    {/* <span>Select an image from your computer or device.</span> */}
                  </div>
                </div>

                {this.state.img.length > 0 && (
                  <div className="form-column-direction">
                    {this.state.img.map((item, id) => (
                      <div key={id} className="relative">
                        <img src={item} className="form-flex-0 m-10" />
                        <div
                          className="btn btn-school btn-image-clear"
                          onClick={e => this.clearImage(id)}
                        >
                          <i className="fa fa-trash" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    );
  }
}

class Range extends React.Component {
  constructor(props) {
    super(props);
    this.inputField = React.createRef();
    this.state = {
      value:
        props.defaultValue !== undefined
          ? parseInt(props.defaultValue, 10)
          : parseInt(props.data.default_value, 10),
    };
  }

  changeValue = e => {
    const {target} = e;
    this.setState({
      value: target.value,
    });
  };

  render() {
    const props = {};
    const name = this.props.data.field_name;

    props.type = "range";
    props.list = `tickmarks_${name}`;
    props.min =
      typeof this.props.data.min_value === "string"
        ? parseInt(this.props.data.min_value)
        : this.props.data.min_value;
    props.max =
      typeof this.props.data.max_value === "string"
        ? parseInt(this.props.data.max_value)
        : this.props.data.max_value;
    props.step =
      typeof this.props.data.step === "string"
        ? parseInt(this.props.data.step)
        : this.props.data.step;

    props.value = this.state.value;
    props.change = this.changeValue;

    if (this.props.mutable) {
      props.ref = this.inputField;
    }

    const datalist = [];
    for (
      let i = parseInt(props.min_value, 10);
      i <= parseInt(props.max_value, 10);
      i += parseInt(props.step, 10)
    ) {
      datalist.push(i);
    }

    const oneBig = 100 / (datalist.length - 1);

    const _datalist = datalist.map((d, idx) => (
      <option key={`${props.list}_${idx}`}>{d}</option>
    ));

    const visible_marks = datalist.map((d, idx) => {
      const option_props = {};
      let w = oneBig;
      if (idx === 0 || idx === datalist.length - 1) {
        w = oneBig / 2;
      }
      option_props.key = `${props.list}_label_${idx}`;
      option_props.style = {width: `${w}%`};
      if (idx === datalist.length - 1) {
        option_props.style = {width: `${w}%`, textAlign: "right"};
      }
      return <label {...option_props}>{d}</label>;
    });

    let baseClasses = "SortableItem rfb-item form-label-el";
    if (this.props.data.pageBreakBefore) {
      baseClasses += " alwaysbreak";
    }

    return (
      <div className={baseClasses}>
        <ComponentHeader {...this.props} />
        <div className="form-group">
          <ComponentLabel {...this.props} />
          {this.props.data.value ? (
            <span>
              &nbsp; {this.props.data.value} of {this.props.data.max_value}
            </span>
          ) : (
            <div className="range">
              <div className="clearfix">
                <span className="pull-left">{this.props.data.min_label}</span>
                <span className="pull-right">{this.props.data.max_label}</span>
              </div>
              <ReactBootstrapSlider {...props} />
            </div>
          )}
          <div className="visible_marks">{visible_marks}</div>
          <input name={name} value={this.state.value} type="hidden" />
          <datalist id={props.list}>{_datalist}</datalist>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    token: state.auth.token,
    uploadingImages: state.formBuilder.uploadingImages
  };
};

const mapDispatchToProps = dispatch => {
  return {
    formActions: bindActionCreators(formActions, dispatch),
  };
};

FormElements.Header = Header;
FormElements.Paragraph = Paragraph;
FormElements.Label = Label;
FormElements.LineBreak = LineBreak;
FormElements.TextInput = TextInput;
FormElements.NumberInput = NumberInput;
FormElements.TextArea = TextArea;
FormElements.Dropdown = Dropdown;
FormElements.Signature = connect(mapStateToProps, mapDispatchToProps)(Signature);
FormElements.Checkboxes = Checkboxes;
FormElements.DatePicker = DatePicker;
FormElements.RadioButtons = RadioButtons;
FormElements.Image = connect(mapStateToProps, mapDispatchToProps)(Image);
FormElements.Rating = Rating;
FormElements.Tags = Tags;
FormElements.HyperLink = HyperLink;
FormElements.Download = Download;
FormElements.Camera = connect(mapStateToProps, mapDispatchToProps)(Camera);
FormElements.Range = Range;
FormElements.Table = Table;

export default FormElements;
