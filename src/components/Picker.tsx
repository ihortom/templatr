import { useState } from 'react';
import { Fragment } from 'react/jsx-runtime';

import Button from 'react-bootstrap/Button';
import {v4 as uuid} from 'uuid';
import Template from './Template';


type PickerProps = {
    items: object,      // templates
    comments: object,   // {"template": "comment"}
    type: string,       // type of template
    value: string       // value to replace template variable _VAR_
};


const Picker = ({items, comments, type, value}: PickerProps) => {

    const entries = Object.entries(items);
    const [copiedElement, setElement] = useState(null);

    let key=0;

    const copyToClipboard = async (element: EventTarget) => {
        const id = (element as HTMLElement).id;
        const textElement = document.getElementById('text-' + id) as HTMLInputElement;

        try {
            await navigator.clipboard.writeText(textElement.innerHTML);
            setElement(element);
        } catch (err) {
            if (process.env.NODE_ENV == 'development')
                console.log(`Failed to copy: ${err}`);
        }
    };

    return (
        <Fragment key={`${uuid()}`}>
            {
                entries.map((i) => {
                    const typeId = type.replace(' ', '-').toLowerCase();

                    // get comment
                    const tmp = Object.entries(comments).find(k => i[1].includes(k[0]));
                    const comment = tmp ? tmp[1] : '';
                    const baseline = Object.entries(comments).find(k => i[1] == k[0]) ? '' : ' baseline';

                    key++;                 

                    return (
                        <Fragment key={`${uuid()}`}>
                            <Button
                                key={`btn-${key}`} className="picker"
                                id={`${typeId}-${key}`}
                                variant={`${copiedElement !== null && copiedElement.id === (typeId + '-' + key) ? "outline-success" : "light"}`}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    const prevElelemnt = document.querySelector('.btn-outline-success')
                                    if (prevElelemnt !== null && prevElelemnt !== copiedElement) {
                                        prevElelemnt.classList.add('btn-light')
                                        prevElelemnt.classList.remove('btn-outline-success')
                                    }
                                    copyToClipboard(e.target)
                                }}
                            >
                                <Template entry={i[1]} value={value} />
                            </Button>
                            <span 
                                className={`comment${baseline}`}
                                title={`${baseline ? comment : ''}`}
                                onContextMenu={(e: React.MouseEvent<HTMLElement>) => {
                                    e.preventDefault();
                                    window.electron.showContextMenu(e.target);
                                }}
                            >
                                {`${comment.length > 0 ?  ' # ' + comment : ''}`}
                            </span>
                            <br />
                            <textarea className="hidden" 
                                key={`text-${typeId}-${key}`} id={`text-${typeId}-${key}`}
                                readOnly={true}
                                value={`${value !== '' ? i[1].replaceAll('_VAR_', value) : i[1]}`}
                            ></textarea>
                        </Fragment>
                    )
                })
            }
        </Fragment>
    );
};

export default Picker;
