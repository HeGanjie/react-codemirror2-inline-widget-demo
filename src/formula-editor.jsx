import React from 'react'
import {Controlled as CodeMirror} from 'react-codemirror2'
import './formula-editor.css'
import _ from 'lodash'
import ReactDOM from 'react-dom'
require('codemirror/lib/codemirror.css');
require('codemirror/theme/xq-light.css');
require('codemirror/mode/javascript/javascript.js');

class Widget extends React.Component {
  render() {
    let {info} = this.props;
    return ReactDOM.createPortal(
      info.render(),
      info.mountToDom
    )
  }
}

export default class FormulaEditor extends React.Component {
  editor = null;
  
  state = {
    widgets: []
  };
  
  insertText = text => {
    let cursor = this.editor.getCursor();
    this.editor.replaceRange(text, cursor)
  };
  
  replaceToWidget = (editor, data, value, inlineWidgetOpts) => {
    editor.getAllMarks().forEach(m => m.clear());
    let posInfos = _.flatMap(_.keys(inlineWidgetOpts), widgetName => {
      let {regex, render} = inlineWidgetOpts[widgetName];
      let res = [], newRe = new RegExp(regex, 'g'), m;
      do {
        m = newRe.exec(value);
        if (m) {
          const mountToDom = document.createElement('span');
          let text = m[0];
          res.push({
            widgetName,
            text,
            startAt: m.index,
            endAt: m.index + text.length,
            render: () => {
              let x = `((...args) => args)${text.replace(new RegExp(`^${widgetName}`), '')}`;
              let args = eval(x);
              return render(...args);
            },
            mountToDom: mountToDom
          })
        }
      } while (m);
      return res
    });
    posInfos.forEach(posInfo => {
      let from = {line: 0, ch: posInfo.startAt};
      let to = {line: 0, ch: posInfo.endAt};
      editor.markText(from, to, {
        replacedWith: posInfo.mountToDom,
        clearWhenEmpty: false
      });
      // console.log(from, to, mt.find())
    });
    this.setState({
      widgets: posInfos
    }, () => {
      editor.refresh();
      editor.focus()
    })
  };
  
  render() {
    let {onChange, options, inlineWidgetOpts, ...rest} = this.props;
    let {widgets} = this.state;
    return (
      <React.Fragment>
        <CodeMirror
          editorDidMount={editor => {
            this.editor = editor
          }}
          onBeforeChange={(editor, data, value) => {
            value = value.replace(/\r?\n/g, ''); // 简单起见，暂不允许换行
            onChange(value);
            // console.log(value)
          }}
          onChange={(editor, data, value) => {
            // console.log('controlled', {value});
            this.replaceToWidget(editor, data, value, inlineWidgetOpts)
          }}
          options={{
            mode: 'javascript',
            theme: 'xq-light',
            lineNumbers: false,
            lineWrapping: true,
            ...options
          }}
          {...rest}
        />
        {widgets.map((w, i) => {
          return (
            <Widget key={i} info={w} />
          )
        })}
      </React.Fragment>
    )
  }
}
