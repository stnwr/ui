import React from 'react'
// import PropTypes from 'prop-types'

class Diagram extends React.Component {
  state = {}

  constructor (props) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount () {
    this.scheduleLayout()
  }

  componentWillReceiveProps () {
    this.scheduleLayout()
  }

  scheduleLayout () {
    setTimeout(() => {
      const { app } = this.props
      const layout = getLayout(app, this.ref.current)

      this.setState({
        layout: layout.pos
      })
    }, 200)
  }

  render () {
    const { app } = this.props
    const { data, schema, uiSchema, layout } = this.state

    return (
      <div className='col-md-10 col-md-offset-2 main'>
        <div>
          <div ref={this.ref} style={layout &&
            { width: layout.width, height: layout.height, position: 'relative' }}>
            {app.tables.map((table, index) => {
              const style = { padding: '10px', display: 'inline-block', position: 'absolute' }

              if (layout) {
                const { top, left } = layout.nodes[index]
                Object.assign(style, { top, left })
              }

              return (
                <div
                  key={table.name}
                  style={style}
                  className='bg-primary'>

                  <div>
                    <small><strong>{table.title}</strong></small>
                  </div>
                </div>
              )
            })}

            {layout &&
              <Lines layout={layout} app={app} />}
          </div>
        </div>
      </div>
    )
  }
}

function getLayout (app, el) {
  const { tables } = app
  // Create a new directed graph
  var g = new window.dagre.graphlib.Graph({ multigraph: true })

  // Set an object for the graph label
  g.setGraph({
    rankdir: 'LR',
    marginx: 50,
    marginy: 150,
    ranksep: 260,
    nodesep: 250,
    edgesep: 200,
    labelpos: 'c'
  })

  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(function () { return {} })

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each node
  const relations = []
  tables.forEach((table, index) => {
    const pageEl = el.children[index]
    const relationFields = table.fields.filter(f => f.type === 'relation')

    relations.push(...relationFields.map(field => ({
      field,
      source: table,
      target: tables.find(t => t.name === field.table)
    })))

    g.setNode(table.name, { label: table.title, width: pageEl.offsetWidth, height: pageEl.offsetHeight, table })
  })

  // Add edges to the graph.
  relations.forEach(relation => {
    g.setEdge(relation.source.name, relation.field.table, { relation }, relation.name)
  })
  // tables.forEach(table => {
  //   const relations = tableRelations(app, table)
  //   console.log(relations)
  //   relations.forEach(relation => {
  //     g.setEdge(table.name, relation.join.to.table, { relation }, relation.name)
  //   })
  //   // if (Array.isArray(table.next)) {
  //   //   table.next.forEach(next => {
  //   //     // The linked node (next page) may not exist if it's filtered
  //   //     const exists = tables.find(page => page.path === next.path)
  //   //     if (exists) {
  //   //       g.setEdge(table.path, next.path)
  //   //     }
  //   //   })
  //   // }
  // })

  window.dagre.layout(g)

  const pos = {
    nodes: [],
    edges: []
  }

  const output = g.graph()
  pos.width = output.width + 'px'
  pos.height = output.height + 'px'
  g.nodes().forEach((v, index) => {
    const node = g.node(v)
    const pt = { node }
    pt.top = (node.y - node.height / 2) + 'px'
    pt.left = (node.x - node.width / 2) + 'px'
    pos.nodes.push(pt)
  })

  g.edges().forEach((e, index) => {
    const edge = g.edge(e)
    pos.edges.push({
      source: e.v,
      target: e.w,
      relation: edge.relation,
      points: edge.points.map(p => {
        const pt = {}
        pt.y = p.y
        pt.x = p.x
        return pt
      })
    })
  })

  return { g, pos }
}

class Lines extends React.Component {
  state = {}

  editLink = (edge) => {
    console.log('clicked', edge)
    this.setState({
      showEditor: edge
    })
  }

  render () {
    const { layout, app } = this.props

    return (
      <div>
        <svg height={layout.height} width={layout.width}>
          {
            layout.edges.map(edge => {
              const points = edge.points.map(points => `${points.x},${points.y}`).join(' ')

              return (
                <g key={points}>
                  <polyline style={{ fill: 'none', strokeWidth: 1, stroke: '#4781ff' }}
                    // onClick={() => this.editLink(edge)}
                    points={points} />
                  {/* <text x={x2} y={y2}>{relation.type}</text> */}
                </g>
              )
            })
          }
        </svg>
        <div style={{ position: 'absolute', width: layout.width, height: layout.height, top: 0 }}>
          {
            layout.edges.map((edge, index) => {
              const { relation } = edge

              const pts = edge.points
              const len = pts.length
              const x1 = (pts[0].x + pts[1].x) / 2
              const y1 = (pts[0].y + pts[1].y) / 2
              const x2 = (pts[len - 1].x + pts[len - 2].x) / 2
              const y2 = (pts[len - 1].y + pts[len - 2].y) / 2

              const styles = {
                // color: '#000',
                // padding: '4px 8px',
                // // fontSize: '0.625rem',
                // maxWidth: '300px',
                // fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                // lineHeight: '1.4em',
                // borderRadius: '4px',
                // backgroundColor: 'rgba(0, 0, 0, 0.3)',
                position: 'absolute'
              }

              return (
                <div key={index}>
                  <div style={Object.assign({ top: y1 + 'px', left: x1 + 'px' }, styles)}>
                    <small>{`${relation.field.kind} <${relation.field.from}>`}</small>
                  </div>
                  <div style={Object.assign({ top: y2 + 'px', left: x2 + 'px' }, styles)}>
                    <small>{`${relation.field.name} <${relation.field.to}>`}</small>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default Diagram
