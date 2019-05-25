import React, {useState, useRef} from 'react';
import './App.css';
import FormulaEditor from "./formula-editor";

function App() {
  let [editorText, onEditorTextChange] = useState('');
  let editor = useRef(null);
  return (
    <div className="App">
      <FormulaEditor
        ref={editor}
        value={editorText}
        onChange={val => onEditorTextChange(val)}
        className="my-formula-editor border"
        inlineWidgetOpts={{
          useObject: {
            regex: /useObject\("[^)]+"\)/,
            render: (objId) => {
              return (
                <div
                  className="border iblock"
                  style={{padding: '5px'}}
                  onClick={() => alert(objId)}
                >{objId}</div>
              )
            }
          }
        }}
      />
      <button
        style={{marginTop: '10px'}}
        onClick={() => {
          editor.current.insertText('useObject("xxx")')
        }}
      >Add Term</button>
    </div>
  );
}

export default App;
