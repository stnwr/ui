import React from 'react'
import Form from 'react-jsonschema-form'
import update from 'immutability-helper'
import { enumTypes } from './schema/types.js'
import { getSchemaFromField } from '@stoneware/common/helpers/schema'

function CustomFieldTemplate (props) {
  const { id, classNames, label, help, required, description, errors, children } = props
  return (
    <div className={classNames}>
      <label htmlFor={id}><strong>{label}</strong> {required ? '*' : null}</label>
      {description}
      {children}
      {errors}
      {help}
    </div>
  )
}

const Editor = (props) => {
  const { field, schema, formData, uiSchema, onChange,
    onSubmit, onError, nullable = true } = props

  const defaultSupportedTypes = [
    'string', 'date', 'datetime',
    'time', 'integer', 'number', 'boolean'
  ]

  const defaultProp = {}
  if (defaultSupportedTypes.includes(field.type)) {
    const fieldSchema = getSchemaFromField(field)
    defaultProp.default = {
      type: fieldSchema.type,
      title: 'Default value',
      format: fieldSchema.format,
      enum: fieldSchema.enum
    }
  }

  const enumSupportedTypes = [
    'string', 'integer'
  ]

  const enumProp = {}
  if (enumSupportedTypes.includes(field.type)) {
    const fieldSchema = getSchemaFromField(field)
    enumProp.enum = {
      type: 'array',
      items: {
        type: fieldSchema.type
      },
      title: 'Enum'
    }
  }

  const virtualSupportedTypes = defaultSupportedTypes

  const virtualProp = {}
  if (virtualSupportedTypes.includes(field.type)) {
    virtualProp.virtual = {
      type: 'boolean',
      title: 'Virtual',
      description: 'Virtual fields aren\'t persisted. You must provide a property (or method) in the model class.'
    }
  }

  const editorSchema = {
    type: 'object',
    required: Array.isArray(schema.required)
      ? ['name', 'type', 'title'].concat(schema.required)
      : ['name', 'type', 'title'],
    properties: Object.assign({
      name: { type: 'string', title: 'Name' },
      type: { type: 'string', title: 'Type', enum: enumTypes },
      title: { type: 'string', title: 'Title' },
      description: { type: 'string', title: 'Description' }
    }, schema.properties, nullable ? {
      nullable: { type: 'boolean', title: 'Nullable' }
    } : {}, virtualProp, defaultProp, enumProp)
  }

  const editorUiSchema = Object.assign({}, uiSchema, {
    'ui:rootFieldId': formData.name,
    type: {
      'ui:widget': 'hidden'
    }
  })

  return <Form
    schema={editorSchema}
    formData={formData}
    uiSchema={editorUiSchema}
    onChange={onChange}
    onSubmit={onSubmit}
    onError={onError}
    // FieldTemplate={CustomFieldTemplate}
  />
}

const DefaultEditor = (props) => {
  const field = props.field
  const schema = {
    properties: {}
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const StringEditor = (props) => {
  const field = props.field
  const formats = ['email', 'hostname', 'ipv4', 'ipv6', 'uri']
  const schema = {
    properties: {
      minLength: { type: 'integer', title: 'Min length' },
      maxLength: { type: 'integer', title: 'Max length' },
      pattern: { type: 'string', title: 'Regex' },
      format: { type: 'string', title: 'Format', enum: formats }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const IntegerEditor = (props) => {
  const field = props.field

  const schema = {
    properties: {
      minimum: { type: 'integer', title: 'Minimum' },
      maximum: { type: 'integer', title: 'Maximum' }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const NumberEditor = (props) => {
  const field = props.field

  const schema = {
    properties: {
      minimum: { type: 'number', title: 'Minimum' },
      maximum: { type: 'number', title: 'Maximum' }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const BooleanEditor = (props) => {
  const field = props.field

  const schema = {
    properties: {
      // enumName: { type: 'array', title: 'Names', items: { type: 'string' } }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const JsonEditor = (props) => {
  const field = props.field

  const schema = {
    required: ['ref'],
    properties: {
      ref: { type: 'string', title: 'Ref' }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

const FkEditor = (props) => {
  const { field, tables } = props

  const schema = {
    required: ['table', 'field'],
    properties: {
      table: { type: 'string', title: 'Table', enum: tables.map(t => t.name), enumNames: tables.map(t => t.title) },
      field: { type: 'string', title: 'Field', enum: field.table ? tables.find(t => t.name === field.table).fields.map(f => f.name) : undefined }
    }
  }

  const uiSchema = {}

  return <Editor
    schema={schema}
    formData={field}
    uiSchema={uiSchema}
    {...props} />
}

class RelationEditor extends React.Component {
  constructor (props) {
    super(props)
    this.state = this.getState(props)
  }

  getState (props) {
    const { tables, table, field } = props

    const schema = {
      required: ['kind', 'from', 'table', 'to'],
      properties: {
        kind: { type: 'string', title: 'Kind', enum: ['BelongsToOne', 'HasOne', 'HasMany'] },
        from: { type: 'string', title: 'From', enum: table.fields.map(f => f.name) },
        table: { type: 'string', title: 'Table', enum: tables.map(t => t.name), enumNames: tables.map(t => t.title) },
        to: { type: 'string', title: 'To', enum: field.table && RelationEditor.getToEnums(field.table, tables) }
      }
    }

    return {
      schema,
      table: field.table,
      formData: field
    }
  }

  componentWillReceiveProps (props) {
    this.setState(this.getState(props))
  }

  static getToEnums (tableName, tables) {
    const toEnumFields = tableName && tables.find(t => t.name === tableName).fields
    return toEnumFields && toEnumFields.map(f => f.name)
  }

  onChange = (e) => {
    const { formData } = e
    const { tables } = this.props
    const { schema, table } = this.state

    if (table !== formData.table) {
      const updated = update(schema, {
        properties: {
          to: {
            enum: {
              $set: RelationEditor.getToEnums(formData.table, tables)
            }
          }
        }
      })

      this.setState({
        formData,
        schema: updated,
        table: formData.table
      })

      if (this.props.onChange) {
        this.props.onChange(e)
      }
    }
  }

  render () {
    const props = this.props
    const { schema, formData } = this.state
    const { tables, table } = props

    const uiSchema = {
    }

    return <Editor
      nullable={false}
      schema={schema}
      formData={formData}
      uiSchema={uiSchema}
      {...this.props}
      onChange={this.onChange} />
  }
}

const typeEditors = {
  'string': StringEditor,
  'integer': IntegerEditor,
  'boolean': BooleanEditor,
  'number': NumberEditor,
  'fk': FkEditor,
  'json': JsonEditor,
  'relation': RelationEditor
}

class FieldEditor extends React.Component {
  constructor (props) {
    super(props)
    console.log('ctor')
    this.state = {
      formData: props.field
    }
  }

  componentWillReceiveProps (props) {
    this.setState({
      formData: props.field
    })
  }

  onChange = (e) => {
    const { formData } = e
    this.setState({ formData })

    if (this.props.onChange) {
      this.props.onChange(e)
    }
  }

  render () {
    // const { field } = this.props
    const field = this.state.formData
    const Type = typeEditors[field.type] || DefaultEditor

    return (
      <div className='field-editor'>
        <Type {...this.props} field={field} onChange={this.onChange} />
      </div>
    )
  }
}

export default FieldEditor
