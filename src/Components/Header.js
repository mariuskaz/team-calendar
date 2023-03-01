import React from 'react'

export default function Header({title, label}) {
    return (
        <div className='header'>
          {title} <span>{label}</span>
        </div>
      )
}
