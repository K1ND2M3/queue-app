import React from 'react'
import './StatCard.css';

function StatCard({title, value, type = 'default'}) {
  return (
    <div className={`stat-card ${type}`}>
        <div className='stat-value'>{value}</div>
        <div className='stat-title'>{title}</div> 
    </div>
  )
}

export default StatCard
