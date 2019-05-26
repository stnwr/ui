import React from 'react'

export default function Dialog (props) {
  return (
    <>
      <div className='modal-backdrop fade in' />
      <div className='modal' style={{ display: 'block' }}>
        <div className='modal-dialog modal-sm'>
          <div className='modal-content'>
            <div className='modal-header'>
              <button type='button' className='close' onClick={props.onClickClose}>×</button>
              <h4 className='modal-title'>{props.title}</h4>
            </div>
            <div className='modal-body'>
              {props.children}
            </div>
            {props.footer && (
              <div className='modal-footer'>
                {/* <button type='button' className='btn btn-primary'>Save changes</button> */}
                {props.footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
