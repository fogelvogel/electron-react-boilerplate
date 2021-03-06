import React, { Component } from 'react';
// import { saveTestToFile } from '../helpers';
// import * as confStore from '../store/configureStore';
import { Link } from 'react-router-dom';
import { addTestString, deletePrevious } from '../actions/testBodyActions';
import * as initial from '../initialState';
import { convertTest } from '../helpers';

import routes from '../constants/routes';

const electron = require('electron');

const { ipcRenderer, remote } = electron;

let prevString;

let wait = null;
let exists = null;
const toTest = [];
const namesOfTestingAttributes = ['text', 'size', 'classes'];

ipcRenderer.on('need to delete previous two', deletePreviousTwo);
ipcRenderer.on('new test string available', addString);
ipcRenderer.on('new test available', loadTest);
ipcRenderer.on('need to save as', helpingFunction);
ipcRenderer.on('need to save', helpingFunction);
type Props = {
  waitForElement: () => void,
  fixData: () => void,
  doTestAction: () => void,
  clearTest: () => void,
  deleteOneString: () => void,
  testBody: [],
  mode: 0
};
// // const store = confStore.configureStore();
const store = initial.getStore();

let currentTestName = 'unnamed';

let state = null;
function helpingFunction() {
  const oldString = remote.getGlobal('savingName').name;

  const endSymbol = oldString.slice(oldString.length - 1, oldString.length);
  if (endSymbol === '#') {
    ipcRenderer.send('saving-as-first');
  } else {
    state = store.getState();
    ipcRenderer.send('save-test', state.testBody);
    // saveTestToFile(state);
    console.log(oldString);
    const splittedFileName = oldString.split('\\');

    currentTestName = splittedFileName[splittedFileName.length - 1];
  }
}

function helpConvertTest() {
  state = store.getState();
  convertTest(state);
}
function deletePreviousTwo() {
  state = store.getState();
  if (state.mode === 2) {
    store.dispatch(deletePrevious());
    store.dispatch(deletePrevious());
  }
}
function loadTest(event, args) {
  state = store.getState();
  store.dispatch({ type: 'CLEAR_TEST' });
  const testBody = [...args];
  const testBodyLength = testBody.length;
  console.log(testBody);
  for (let i = 0; i < testBodyLength; i += 1) {
    store.dispatch(
      addTestString({
        actionName: testBody[i].actionName,
        attributes: testBody[i].attributes,
        paths: testBody[i].paths
      })
    );
  }
}

function addString(event, args) {
  state = store.getState();
  if (args.actionName === 'url') {
    store.dispatch(addTestString(args));
  }
  if (state.testBody.length > 0)
    prevString = state.testBody[state.testBody.length - 1];

  if (state.mode === 2) {
    if (prevString !== undefined) {
      if (
        prevString.actionName === args.actionName &&
        args.actionName === 'scroll' &&
        prevString.attributes[1] === args.attributes[1]
      ) {
        store.dispatch(deletePrevious());
      }
      if (
        prevString.actionName === args.actionName &&
        args.actionName === 'resize'
      ) {
        store.dispatch(deletePrevious());
      }
    }
    //   prevString = {
    //     actionName: args.actionName,
    //     attributes: args.attributes,
    //     paths: args.paths
    //   };
    store.dispatch(
      addTestString({
        actionName: args.actionName,
        attributes: args.attributes,
        paths: args.paths
      })
    );
  } else if (state.mode === 3) {
    if (args.actionName !== 'click') {
      return;
    }
    const arrToTest = [];
    let counter = 0;
    for (let i = 0; i < 3; i += 1) {
      if (toTest[i].checked) {
        arrToTest.push(namesOfTestingAttributes[i]);
        arrToTest[counter] += `=${args.testParams[i]}`;
        counter += 1;
      }
    }
    if (args.testParams[3] !== null) {
      if (typeof args.testParams[3] === 'boolean') {
        arrToTest.push(`checked=${args.testParams[3]}`);
        counter += 1;
      } else {
        if (Array.isArray(args.testParams[3])) {
          for (let i = 0; i < args.testParams[3].length; i += 1) {
            arrToTest.push(`option=${args.testParams[3][i]}`);
            counter += 1;
          }
          arrToTest.push(`selectedOption=${args.testParams[4]}`);
        } else {
          arrToTest.push(`value=${args.testParams[3]}`);
        }
      }
    }
    const newArgs = {
      actionName: 'test',
      attributes: arrToTest,
      paths: args.paths
    };
    // prevString = newArgs;
    store.dispatch(addTestString(newArgs));
  } else if (state.mode === 1) {
    let waitValue = wait.value;
    if (!waitValue) {
      waitValue = '5000';
    }
    const existValue = exists.checked;
    const newArgs = {
      actionName: 'wait',
      attributes: [existValue, waitValue],
      paths: args.paths
    };
    // prevString = newArgs;
    store.dispatch(addTestString(newArgs));
  }
}

export default class ToolsBar extends Component<Props> {
  props: Props;

  currentDeleting = null;

  render() {
    const {
      waitForElement,
      fixData,
      doTestAction,
      clearTest,
      deleteOneString,
      testBody,
      mode
    } = this.props;

    return (
      <div>
        <div className="wrapper-center-tools">
          <div className="wrapper">
            <div>
              <button type="button" className="go-button">
                <Link to={routes.HOME}>Вернуться</Link>
              </button>
              <div>
                <div className="test-name">
                  <h4 id="testField">{currentTestName}</h4>
                </div>
              </div>
              <div className="delete-test" />
            </div>
            <table className="w3-table w3-bordered w3-margin-top w3-margin-bottom">
              <tr className="first-tr">
                <td>№</td>
                <td>действие</td>
                <td>аттрибуты</td>
                <td>пути</td>
                <td>удалить</td>
              </tr>
              {testBody.map((v, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{`${v.actionName}`}</td>
                  <td className="to-scroll2">{`${v.attributes}`}</td>
                  <td className="to-scroll">{`${v.paths}`}</td>
                  <td>
                    <button
                      onClick={() => {
                        deleteOneString(index + 1);
                      }}
                      className="button-icon"
                      type="button"
                    />
                  </td>
                </tr>
              ))}
            </table>

            <div>
              <div className="buttons-row">
                <button
                  className="mode-button"
                  onClick={clearTest}
                  type="button"
                >
                  очистить
                </button>
                <button
                  className="mode-button"
                  onClick={helpingFunction}
                  type="button"
                >
                  сохранить
                </button>

                <button
                  className="mode-button"
                  data-tclass="btn"
                  type="button"
                  onClick={helpConvertTest}
                >
                  конверт.
                </button>
              </div>
              <div className="buttons-row">
                <button
                  className="mode-button"
                  onClick={waitForElement}
                  type="button"
                >
                  дождаться
                </button>
                <button className="mode-button" onClick={fixData} type="button">
                  записать
                </button>
                <button
                  className="mode-button"
                  onClick={doTestAction}
                  type="button"
                >
                  тестировать
                </button>
              </div>
            </div>
            <DrawAdditionalFields mode={mode} />
          </div>
        </div>
      </div>
    );
  }
}
function DrawAdditionalFields(props) {
  const currMode = props.mode;

  let input = null;

  const setDelay = el => {
    input = el;
  };
  const setWait = el => {
    wait = el;
  };

  const setExists = el => {
    exists = el;
  };

  const setText = el => {
    toTest[0] = el;
  };

  const setSize = el => {
    toTest[1] = el;
  };

  const setClasses = el => {
    toTest[2] = el;
  };

  const addDelayString = () => {
    let delayValue = input.value;
    if (!delayValue) {
      delayValue = '1000';
    }
    store.dispatch(
      addTestString({
        actionName: 'wait',
        attributes: [delayValue],
        paths: []
      })
    );
  };
  switch (currMode) {
    case 1: {
      return (
        <div>
          <h3>
            Введите задержку в мс или выберите элемент, существование которого
            необходимо подождать, мышью
          </h3>
          <input
            type="text"
            placeholder="1000"
            ref={setDelay}
            className="w3-input w3-half"
          />
          <button
            type="button"
            onClick={addDelayString}
            className="w3-btn w3-pink w3-half"
          >
            Добавить задержку
          </button>
          <h3>or</h3>
          <label htmlFor="isExisting">
            <input
              type="checkbox"
              name="is existing"
              ref={setExists}
              className="w3-check"
            />
            Элемент существует, ждем, пока он исчезнет
          </label>
          <input
            type="text"
            placeholder="5000"
            ref={setWait}
            className="w3-input"
          />
          <div>
            <p>
              Если вы хотите указать, что элемент обязательно должен
              существовать во время исполнения теста, выберите его мышью
            </p>
          </div>
        </div>
      );
    }
    case 2: {
      return (
        <div>
          <h3>Начните работу с тестируемой страницей</h3>
          <p>Кликните, напечатайте что-нибудь или измените размер окна</p>
        </div>
      );
    }
    case 3: {
      return (
        <div>
          <h3>Протестируйте значения</h3>
          <label htmlFor="text">
            <input
              type="checkbox"
              name="text"
              ref={setText}
              className="w3-check"
            />
            Текст
          </label>
          <label htmlFor="size">
            <input
              type="checkbox"
              name="size"
              ref={setSize}
              className="w3-check"
            />
            Размер
          </label>
          <label htmlFor="classes">
            <input
              type="checkbox"
              name="classes"
              ref={setClasses}
              className="w3-check"
            />
            Классы
          </label>
          {/* <label htmlFor="attribute">
            <input type="checkbox" name="attribute" className="w3-check"/>
            Attribute
          </label> */}
          <p>Выберите характеристики, которые необходимо протестировать</p>
        </div>
      );
    }
    default:
      return <h3>Выберите режим работы</h3>;
  }
}
