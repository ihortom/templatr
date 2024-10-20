import { Fragment } from 'react/jsx-runtime';
import {v4 as uuid} from 'uuid';


type MultilineProps = {
    multiLine: string   // template entry
};


const Multiline = ({multiLine}: MultilineProps) => {

    // split string at new line
    const arrEntry = (multiLine !== '') ? multiLine.split("\n") : [multiLine];

    return (       
        <>
            {
                arrEntry.length > 1 ?
                arrEntry.slice(0, -1).map(i => {
                    return (
                        <Fragment key={`${uuid()}`}>
                            {i}<br />
                        </Fragment>
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

export default Multiline;
