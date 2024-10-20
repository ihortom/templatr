import {v4 as uuid} from 'uuid';
import { Fragment } from 'react/jsx-runtime';
import Multiline from './Multiline';


type TemplateProps = {
    entry: string,  // template entry
    value: string   // value to replace template variable _VAR_
};

const Template = ({entry, value}: TemplateProps) => {

    // split template value for highlighting
    const arrEntry = (value !== '') ? entry.split('_VAR_') : [entry];

    return (       
        <>
            {
                arrEntry.length > 1 ?               // template entry contains _VAR_
                arrEntry.slice(0, -1).map(i => {    // get first half of template entry
                    return (
                        <Fragment key={`${uuid()}`}>
                            <Multiline multiLine={i}></Multiline>
                            <span className="template">{value}</span> {/* placeholder for template variable substitution */}
                        </Fragment>
                    )
                }) : <Multiline multiLine={entry}></Multiline>
            }
            {
                arrEntry.length > 1 ?
                // add last half of template entry
                <Multiline multiLine={`${arrEntry[arrEntry.length - 1]}`}></Multiline> : <></>
            }
        </>
    );
};

export default Template;
