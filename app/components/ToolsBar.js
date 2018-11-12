import React, { Component } from 'react';
import styles from './Counter.css';

type Props = {
  waitForElement: () => void,
  fixData: () => void,
  doTestAction: () => void
};

export default class ToolsBar extends Component<Props> {
  props: Props;

  render() {
    const { waitForElement, fixData, doTestAction } = this.props;

    return (
      <div>
        <div>
          <div id="testField">{console.log(this.props)}</div>
        </div>
        <div>
          <div className={styles.btnGroup}>
            <button
              className={styles.btn}
              onClick={waitForElement}
              data-tclass="btn"
              type="button"
            >
              wait
              <i className="button wait" />
            </button>
            <button
              className={styles.btn}
              onClick={fixData}
              data-tclass="btn"
              type="button"
            >
              fix
              <i className="button fix" />
            </button>
            <button
              className={styles.btn}
              onClick={doTestAction}
              data-tclass="btn"
              type="button"
            >
              test
              <i className="button test" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
