import React from 'react'

export default function ProgressBar({ title, value, max }) {
    return (
        <div className='progress-bar'>
            <span>{title}</span>
            <progress value={value} max={max} />
            <small style={{float:'right', marginTop:'10px'}}>completed {value} / {max}</small>
        </div>
    )
}
