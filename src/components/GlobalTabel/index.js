/*
 * @Author: your name
 * @Date: 2022-04-07 11:58:39
 * @LastEditTime: 2022-04-22 19:06:50
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \bl-device-manage-test\src\components\GlobalTabel\index.js
 */
import React, { useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Select, Modal, message, Divider } from 'antd';
import { toJS } from 'mobx';
import { GlobalComponent } from 'layouts/TableEdit/config';
import { typeName } from 'constants/status_constant';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  itemData,
  ...restProps
}) => {
  if (index != undefined) {
    let item = itemData[index];
    const ComponentInfo = GlobalComponent[item.name]
    return (
      <td>
        {editing ? (
          <Form.Item
          key={index}
          name={item.label}
          className='formItemStyle'
      >
          {
              item.attr.descripe &&
              <div className='formItemDescripe'>{item.attr.descripe}</div>
          }
          {
              renderDiffComponents(item, index, ComponentInfo)
          }
      </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  }
  return (
    <td>
        {children}
    </td>
  );
};
const { Option } = Select;
const renderDiffComponents = (item, indexs, ComponentInfo) => {
  switch (item.name) {
    case 'Divider':
      return <ComponentInfo key={indexs} {...item.attr}></ComponentInfo>
    case 'Select':
      return (
        <ComponentInfo key={indexs} defaultValue={item.attr.value}>
          {
            item.attr.options.map(subItem => <Option key={subItem.key} value={subItem.value + ''}>{subItem.label}</Option>)
          }
        </ComponentInfo>
      )
    default:
      return <ComponentInfo key={indexs} {...item.attr} />
  }
}
const GlobalTabel = (props) => {
  const [form] = Form.useForm();
  const data = props.dataSource
  const firstFormId = props.firstFormId
  const secondFormId = props.secondFormId
  const itemDataT = props.itemDataT;
  const [editingKey, setEditingKey] = useState('');
  const del = props.del
  const getData = props.getData
  const updataData = props.updataData
  let isLoading = props.loading
  let page = { pageIndex: 1, pageSize: 2 }
  let itemData = []
  const isEditing = (record) => record.key === editingKey;
  const edit = (record) => {
    setEditingKey(record.key);
  };

  const pageChange = (e) => {
    page.pageIndex = e.current;
    getData(page);
    setEditingKey('');
  };
  
  const cancel = (e) => {
    getData(page);
    setEditingKey('');
  };

  const changeField = () => {
    let obj = []
    if (itemDataT.length != 0) {
      let itemData1 = itemDataT.filter(function (txt) {
        return txt.secondFormId == secondFormId
      })
      if (itemData1.length == 0) {
        return [];
      }
      toJS(itemData1)
      if (itemData1[0].properties != undefined && itemData1[0].properties.length != 0) {
        let properties = {}
        properties = toJS(itemData1[0].properties)
        properties.forEach(element => {
          let ele = {}
          ele.label = element.name
          ele.attr = element.others
          delete ele.attr.value
          ele.propertyId = element.propertyId
          ele.name = typeName[element.typeId]
          obj.push(ele)
        });
      } else {
        itemData = []
        return []
      }
    }
    itemData = obj
    return obj
  }
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
      } else {
        newData.push(row);
      }
      const item = newData[index];
      let params = {}
      params.firstFormId = firstFormId
      params.secondFormId = secondFormId
      params.dataId = item.id.toString()
      Modal.confirm({
        title: '提示',
        content: '是否确认修改该条数据',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          let newObj = {}
          Object.keys(item).map((obj) => {
            if (obj.startsWith('tenement')) {
              newObj[obj] = item[obj]
            }
          })
          params.updataData = newObj
          updataData(params)
          setEditingKey('')
          message.success('修改成功')
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const deleteRecord = (txt) => {
    let params = {}
    params.firstFormId = firstFormId
    params.secondFormId = secondFormId
    params.dataId = (txt.id).toString()
    Modal.confirm({
      title: '提示',
      content: '是否确认删除该条数据',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        del(params)
        getData(page)
        props.countObj(firstFormId);
        setEditingKey('')
        message.success('删除成功')
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  const columns = props.columns
  let obj = columns
  const text = obj.pop()
  if (text != undefined && !('align' in text)) {
    obj.push(text)
  }
  obj.push({
    align: 'right',
    width: '20%',
    title: '操作',
    dataIndex: '操作',
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <a
            onClick={() => save(record.key)}
            style={{
              marginRight: 8,
            }}
          >
            Save
          </a>
          <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
            <a>Cancel</a>
          </Popconfirm>
          <Divider type='vertical' />
          <a onClick={() => deleteRecord(record)}>Delete</a>
        </span>
      ) : (
        <span>
          <a disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </a>
        </span>
      );
    },
  })
  changeField();
  for (let index = 0; index < columns.length - 4; index++) {
    const element = columns[index];
    element.editable = true
  }
  const mergedColumns = columns.map((col, index) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.type,
        dataIndex: col.dataIndex,
        title: col.title,
        index: index,
        itemData:itemData,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={props.PageInfo}
        onChange={pageChange}
        loading={isLoading}
      />
    </Form>
  );


};

export default GlobalTabel

