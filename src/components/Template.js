import React from 'react'
import {v4 as uuid} from 'uuid'
import MultiLine from './MultiLine'


const Template = ({entry, value}) => {

    // split template value for highlighting
    const arrEntry = (value !== '') ? entry.split('_VAR_') : [entry]

    return (       
        <>
            {
                arrEntry.length > 1 ?
                arrEntry.slice(0, -1).map(i => {
                    return (
                        <React.Fragment key={`${uuid()}`}>
                            <MultiLine multiLine={i}></MultiLine>
                            <span className="template">{value}</span>
                        </React.Fragment>
                    )
                }) : <MultiLine multiLine={entry}></MultiLine>
            }
            {
                arrEntry.length > 1 ?
                <MultiLine multiLine={`${arrEntry[arrEntry.length - 1]}`}></MultiLine> : <></>
            }
        </>
    )
}

export default Template
