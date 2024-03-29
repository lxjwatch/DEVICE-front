import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { isEmpty } from 'lodash';
import { ContainerQuery } from 'react-container-query';
import classnames from 'classnames';
import { withRouter } from 'react-router-dom';

import Menu from './Menu';
import GlobalHeader from 'components/GlobalHeader';
import Context from './AllContext';
import { Media_Query, s_size, m_size, l_size } from 'constants/configs';
import { Layout, Drawer,Select } from 'antd';


import ErrorNotFound from './ErrorNotFound';
import './index.less';

const { Content } = Layout;
@withRouter
@inject('HomeStore','MessageStore')
@observer
class HomeLayout extends Component {
  state = {
    collapsed: false,
    firstMount: false,
    messageSocket: null
  };

  render() {
    // const isMobile = judgeIsMobile(this.props.type).toString();
    const isAuth = true;
    const layout = <Layout className='home_layout'>
      <GlobalHeader />
      <Layout className='right_layout'>
        <Menu />
        <Content
          style={{
             padding: 15, background: '#fff', minHeight: 280,
            overflowY: 'auto', position: 'relative',borderLeft:'1px solid #c4c2c2'
          }}
          id='home_content'
          mobile={'false'}
        >
          {(isAuth ? this.props.children : <ErrorNotFound />)}
        </Content>
      </Layout>
    </Layout>;
    return (
      <div id='Assets' style={{height:'100%'}}>
        <ContainerQuery query={Media_Query}>
          {params => {
            this.getMediaQuery(params);
            return <Context.Provider value={this.getContext()}>
              <div className={classnames(params)} style={{height:'100%'}}>
                {layout}
              </div>
            </Context.Provider>
          }}
        </ContainerQuery>
        
      </div>
    );
  }
  getMediaQuery = (params) => {
    let current;
    for (let key in params) {
      if (params[key]) {
        current = key;
      }
    }
    if (s_size.includes(current)) {
      this.props.HomeStore.changeValue('size_class', 's_size');
    } else if (m_size.includes(current)) {
      this.props.HomeStore.changeValue('size_class', 'm_size');
    } else if (l_size.includes(current)) {
      this.props.HomeStore.changeValue('size_class', 'l_size');
    }
  }
  getContext = () => {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
      ...this.props
    };
  }
  getLastMenu = () => {
    let list = sessionStorage.getItem('menu') || [];
    if (!isEmpty(list))
      list = JSON.parse(list).reverse();
    return list || [];
  }

  toggle = () => {
    this.props.HomeStore.changeValue('collapsed', !this.props.HomeStore.collapsed);
    this.props.HomeStore.changeValue('isClickCollapsed', true);
  }
  toggleMenu = (actionId) => {
    this.props.HomeStore.toggleMenu({ actionId }, (url) => {
      if (url) {
        this.props.history.push(url);
      } else {
        alert('false');
      }
    });
  }
  static getDerivedStateFromProps(props, state) {
    return {
      firstMount: false,
    }
  }
  componentDidMount() {
    this.setState({
      firstMount: true
    });
    /* 进入即请求菜单 */
    if (this.props.history.location.pathname !== '/login') {
      if(sessionStorage.getItem('token')){
        this.props.HomeStore.getMenuList()

      }
    }
  }
}
export default HomeLayout;