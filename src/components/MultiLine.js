import React from 'react'
import {v4 as uuid} from 'uuid'


const MultiLine = ({multiLine}) => {

    // split string at new line
    const arrEntry = (multiLine !== '') ? multiLine.split("\n") : [multiLine]

    return (       
        <>
            {
                arrEntry.length > 1 ?
                arrEntry.slice(0, -1).map(i => {
                    return (
                        <React.Fragment key={`${uuid()}`}>
                            {i}<br />
                        </React.Fragment>
                    )
                }) : arrEntry[0]
            }
            {
                arrEntry.length > 1 ?
                <>{`${arrEntry[arrEntry.length - 1]}`}</> : <></>
            }
        </>
    )
}

export default MultiLine
