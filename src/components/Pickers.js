import React, { useState } from 'react'
import Button from 'react-bootstrap/Button'
import {v4 as uuid} from 'uuid'
import Template from './Template'


const Picker = ({items, comments, type, value}) => {

    const entries = Object.entries(items)
    const [copiedElement, setElement] = useState(null)

    let key=0;

    const copyToClipboard = (element) => {
        const id = element.id;
        const textElement = document.getElementById('text-' + id);

        textElement.select();
        document.execCommand("copy");
        setElement(element);
    }

    return (
        <React.Fragment key={`${uuid()}`}>
            {
                entries.map((i) => {
                    const typeId = type.replace(' ', '-').toLowerCase();

                    // get comments
                    const comment = Object.keys(comments).length > 0 && Object.keys(comments).includes(i[1]) ? comments[i[1]] : ''

                    key++;                 

                    return (
                        <React.Fragment key={`${uuid()}`}>
                            <Button
                                key={`btn-${key}`} block className="picker"
                                id={`${typeId}-${key}`}
                                variant={`${copiedElement !== null && copiedElement.id === (typeId + '-' + key) ? "outline-success" : "light"}`}
                                onClick={(e) => {
                                    const prevElelemnt = document.querySelector('.btn-outline-success')
                                    if (prevElelemnt !== null && prevElelemnt !== copiedElement) {
                                        prevElelemnt.classList.add('btn-light')
                                        prevElelemnt.classList.remove('btn-outline-success')
                                    }
                                    copyToClipboard(e.target)
                                }}
                            >
                                <Template entry={i[1]} value={value} />
                            </Button><span className="comment">{`${comment.length > 0 ?  ' # ' + comment : ''}`}</span><br />
                            <textarea type="text" className="hidden" 
                                key={`text-${typeId}-${key}`} id={`text-${typeId}-${key}`}
                                readOnly={true}
                                value={`${value !== '' ? i[1].replaceAll('_VAR_', value) : i[1]}`}
                            ></textarea>
                        </React.Fragment>
                    )
                })
            }
        </React.Fragment>
    )
}

export default Picker
