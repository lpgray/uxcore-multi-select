/**
 * MultiSelect Component for uxcore
 * @author peijie.dpj
 *
 * Copyright 2014-2015, Uxcore Team, Alinw.
 * All rights reserved.
 */

import React, { Component, PropTypes } from 'react';
import Dropdown from 'uxcore-dropdown';
import CheckboxGroup from 'uxcore-checkbox-group';
import Button from 'uxcore-button';
import classnames from 'classnames';
import i18n from './i18n';

export default class MultiSelect extends Component {

  static displayName = 'MultiSelect';
  static Item = CheckboxGroup.Item;
  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    dropdownClassName: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    maxSelect: PropTypes.number,
    placeholder: PropTypes.string,
    titleBreakStr: PropTypes.string,
    optionLabelProp: PropTypes.string,
    showSelectAll: PropTypes.bool,
    showClear: PropTypes.bool,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    locale: PropTypes.string,
    showSearch: PropTypes.bool,
  };

  static defaultProps = {
    prefixCls: 'kuma-multi-select',
    className: '',
    dropdownClassName: '',
    value: [],
    disabled: false,
    placeholder: '请选择',
    titleBreakStr: '、',
    optionLabelProp: 'text',
    showSelectAll: true,
    showClear: true,
    onChange() { },
    onSubmit() { },
    locale: 'zh-cn',
    showSearch: false,
  };

  state = {
    visible: false,
    lastValues: this.props.value,
  };

  handleChange = (values) => {
    const { props } = this;
    let newValues = [];
    if (props.maxSelect && values.length > props.maxSelect) {
      newValues = this.state.lastValues;
    } else {
      newValues = values;
      this.setState({ lastValues: values });
    }
    props.onChange(newValues);
  };

  handleSelectAll = () => {
    const { props } = this;
    const valueList = [];
    if (props.disabled) {
      return;
    }
    React.Children.forEach(props.children, (item) => {
      if (!item.props.disabled || this.hasSelected(item.props.value)) {
        valueList.push(item.props.value);
      }
    });

    props.onChange(valueList);
  };

  handleClear = () => {
    const { props } = this;
    const valueList = [];
    if (props.disabled) {
      return;
    }
    React.Children.forEach(props.children, (item) => {
      if (item.props.disabled && this.hasSelected(item.props.value)) {
        valueList.push(item.props.value);
      }
    });
    props.onChange(valueList);
  };

  processLabel = (type) => {
    const { props } = this;
    let res = [];
    res = React.Children.map(props.children, (item) => {
      if (this.hasSelected(item.props.value)) {
        switch (type) {
          case 'content':
            return (
              <span className={`${props.prefixCls}-selection__choice__content`}>
                {item.props[props.optionLabelProp]}
                <span className={`${props.prefixCls}-selection__choice__break`}>
                  {props.titleBreakStr}
                </span>
              </span>
            );
          case 'title':
            return item.props[props.optionLabelProp] + props.titleBreakStr;
          default:
            return '';
        }
      }
      return null;
    }) || [];

    if (res.length === 0) {
      switch (type) {
        case 'content':
          res = (
            <span className={`${props.prefixCls}-selection__placeholder`}>
              {props.placeholder}
            </span>
          );
          break;
        case 'title':
          res = [props.placeholder];
          break;
        default:
          res = '';
      }
    } else if (type === 'title') {
      const len = res.length;
      res[len - 1] = res[len - 1].slice(0, res[len - 1].length - 1);
    }
    return type === 'title' ? res.join('') : res;
  };

  hasSelected = value => this.props.value.indexOf(value) !== -1;

  handleVisibleChange = (visible) => {
    const { props } = this;
    if (props.disabled) {
      return;
    }
    this.setState({
      visible,
    });
  };

  render() {
    const { props } = this;
    let selectOptions = props.children;

    if (this.state.keywords && this.props.showSearch) {
      selectOptions = selectOptions.filter(item => {
        if (item.props.text) {
          return item.props.text.search(this.state.keywords) > -1;
        }
        return false;
      });
    }

    // 检查是否可以点击 全选
    let canSelectItemNumbers = 0;

    React.Children.forEach(selectOptions, (item) => {
      if (!item.props.disabled) {
        canSelectItemNumbers += 1;
      }
    });

    const menu = (
      <div className={`${props.prefixCls}-dropdown-border`}>
        <div className={`${props.prefixCls}-content`}>
          {
            this.props.showSearch ?
              <input
                className="kuma-input"
                type="text"
                style={{
                  margin: '0 auto 10px',
                  height: '30px',
                  lineHeight: '12px',
                  padding: '6px 8px',
                }}
                placeholder={i18n[props.locale].keywordsPlaceholder}
                onChange={(e) => {
                  this.setState({ keywords: e.target.value });
                }}
              /> :
              null
          }
          <CheckboxGroup
            onChange={this.handleChange}
            value={props.value}
          >
            {
              React.Children.map(selectOptions, (item, index) => (
                <CheckboxGroup.Item {...item.props} key={index} jsxdisabled={props.disabled} />
              ))
            }
          </CheckboxGroup>
        </div>
        <div
          className={
            classnames(`${props.prefixCls}-footer`, {
              [`${props.prefixCls}-footer-hidden`]:
              !props.maxSelect && !props.showClear && !props.showSelectAll,
            })
          }
        >
          {!!props.maxSelect && <p>{
            i18n[props.locale].maxSelect[0] +
            props.maxSelect +
            i18n[props.locale].maxSelect[1]
          }</p>
          }
          <Button
            className={classnames({
              [`${props.prefixCls}-button`]: true,
              [`${props.prefixCls}-button-hidden`]: !props.showSelectAll,
            })}
            size="small"
            disabled={!!(props.maxSelect && (props.maxSelect < canSelectItemNumbers))}
            onClick={this.handleSelectAll}
          >{i18n[props.locale].selectAll}
          </Button>

          <Button
            className={classnames({
              [`${props.prefixCls}-button`]: true,
              [`${props.prefixCls}-button-hidden`]: !props.showClear,
            })}
            size="small"
            type="secondary"
            onClick={this.handleClear}
          >{i18n[props.locale].clear}
          </Button>
        </div>
      </div>
    );

    return (
      <div>
        <Dropdown
          overlay={menu}
          minOverlayWidthMatchTrigger={false}
          visible={this.state.visible}
          onVisibleChange={this.handleVisibleChange}
          trigger={['click']}
          overlayClassName={classnames({
            [`${props.prefixCls}-dropdown`]: true,
            [props.dropdownClassName]: !!props.dropdownClassName,
          })}
        >
          <span
            className={classnames({
              [props.prefixCls]: true,
              [props.className]: !!props.className,
              [`${props.prefixCls}-open`]: this.state.visible,
              [`${props.prefixCls}-disabled`]: props.disabled,
            })}
          >
            <span className={`${props.prefixCls}-selection ${props.prefixCls}-selection--multiple`}>
              <span
                className={`${props.prefixCls}-selection--multiple--content`}
                title={this.processLabel('title')}
              >
                {this.processLabel('content')}
              </span>
              <span className={`${props.prefixCls}-arrow`} />
            </span>
          </span>
        </Dropdown>
      </div>
    );
  }

}
