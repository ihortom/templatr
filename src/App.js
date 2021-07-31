import React, { useState, useRef, useEffect } from 'react';

import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert'
import {v4 as uuid} from 'uuid'
import { GoX } from 'react-icons/go'

import Picker from './components/Pickers';



const App = () => {

    const getData = () => {
        try {
            return window.electron.getTemplateSync()
        }
        catch(err) {
            return {}
        }
    }
    const data = useRef(getData())

    const getComments = () => {
        try {
            return window.electron.getComments()
        }
        catch(err) {
            return {}
        }
    }
    const comments = useRef(getComments())

    const [filter, setFilter] = useState({
        types: [],      // all types
        var: '',        // _VAR_ replacement
        values: {},     // dict of types (key) with array of templates (value)
        picked: [],     // selected type
        search: '',     // search pattern case insensitive
        error: null     // error during initialization
    })

    const selectSearchItem = (e) => {
        if (e !== 'Reset') {
            const allowed = [e];

            const filtered = Object.keys(data.current)
                                .filter(key => allowed.includes(key))
                                .reduce((obj, key) => {
                                    return {
                                        ...obj,
                                        [key]: data.current[key].filter(i => i.includes(filter.search))
                                    };
                                }, {})
            setFilter({...filter, picked: [e], values: filtered})
        }
    }

    const resetItems = () => {
        setFilter({
            ...filter,
            types: Object.keys(data.current), 
            values: data.current,
            picked: Object.keys(data.current),
            search: ''
        });

        // clear search box
        const searchBox = document.getElementById('search-pattern');
        searchBox.value = ''
    }

    const selectByPatern = (pattern) => {
        
        if (pattern !== '') {           
            const f = Object.entries(data.current)
                        .map(i => [i[0], (i[1].filter(j => j.toLowerCase().includes(pattern.toLowerCase())))])
                        .filter(i => i[1].length > 0)

            const filtered = filter.picked.length === 1 ? 
                                Object.fromEntries(f.filter(i => i[0] === filter.picked[0])) :
                                Object.fromEntries(f);

            setFilter({
                ...filter,
                values: filtered,
                search: pattern
            });
        }
        else {
            setFilter({
                ...filter,
                values: filter.picked.length === 1 ? 
                    Object.keys(data.current)
                    .filter(key => filter.picked.includes(key))
                    .reduce((obj, key) => {
                        return {
                            ...obj,
                            [key]: data.current[key]
                        };
                    }, {}) : 
                    data.current,
                search: ''
            });
        }
    }

    const selectByPaternOnRestore = (pattern) => {

        if (pattern !== '') {
            const f = Object.entries(data.current)
                        .map(i => [i[0], (i[1].filter(j => j.toLowerCase().includes(pattern.toLowerCase())))])
                        .filter(i => i[1].length > 0)

            const filtered = Object.fromEntries(f);

            setFilter({
                ...filter,
                types: Object.keys(data.current),
                values: filtered,
                picked: Object.keys(data.current),
                search: pattern
            });
        }
        else {
            setFilter({
                ...filter,
                types: Object.keys(data.current),
                values: data.current,
                picked: Object.keys(data.current),
                search: ''
            });
        }
    }

    const assignVar = (target) => {     
        setFilter({
            ...filter,
            var: target.value
        });
        if (target.value != '') {
            target.classList.add('filled')
        }
        else {
            target.classList.remove('filled')
        }
    }

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            setFilter({...filter, 
                types: Object.keys(data.current), 
                values: data.current,
                picked: Object.keys(data.current),
                error: "error" in data.current ? data.current.error : null
            })
        }
    }, [data])

    // Main
    return (
        <div className="App">
            <div id="header">
                <InputGroup>
                    <DropdownButton
                        id="type-selector"
                        title={`${filter.picked.length > 1 || filter.picked.length === 0? "Pick template type" : filter.picked[0]}`}
                        variant={`${filter.picked.length > 1 ? "secondary" : "primary"}`}
                        onSelect={ selectSearchItem }
                    >
                        {filter.types.sort().map((i) => {
                            return (<Dropdown.Item key={`dpItem-${i}`} eventKey={`${i}`}>{i}</Dropdown.Item>)
                        })}
                        <Dropdown.Divider />
                        <Dropdown.Item key="Restore" eventKey="Restore"
                            onSelect={() => {
                                const searchBox = document.getElementById('search-pattern');
                                selectByPaternOnRestore(searchBox.value);
                            }}
                        >All types</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item key="Reset" eventKey="Reset"
                            onSelect={resetItems}
                        >Reset</Dropdown.Item>
                    </DropdownButton>
                    <FormControl 
                        id="search-pattern"
                        placeholder="Search pattern"
                        type="text"
                        onChange={(e) => {
                            e.preventDefault();
                            selectByPatern(e.target.value)
                        }}
                    />
                    <InputGroup.Append>
                        <Button variant="danger"
                            onClick={() => {
                                document.getElementById('search-pattern').value = '';
                                selectByPatern('');
                            }}
                        ><GoX /></Button>
                    </InputGroup.Append>
                    <div className="washer"></div>
                    <FormControl 
                        id="template-box"
                        className="template-value" 
                        placeholder="Template value"
                        type="text"
                        onChange={(e) => {
                            e.preventDefault();
                            assignVar(e.target);
                        }}
                    />
                    <InputGroup.Append>
                        <Button variant="success"
                            onClick={() => {
                                const target = document.getElementById('template-box');
                                window.electron.pasteFromClipboard(target);
                                assignVar(target);
                            }}
                        >Paste</Button>
                    </InputGroup.Append>
                    <InputGroup.Append>
                        <Button variant="danger"
                            onClick={() => {
                                const templateBox = document.getElementById('template-box');
                                templateBox.value = '';
                                assignVar(templateBox);
                            }}
                        ><GoX /></Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>
            <div id="templates">
                {
                    filter.error !== null ?
                    <>
                        <Alert className="alert" variant="danger">Template Error: {filter.error}</Alert>
                        <Alert className="alert" variant="warning">Edit templates from Menu {`->`} Edit Templates</Alert> 
                    </>:
                    (Object.keys(filter.values).length === 0 && filter.search.length === 0 ?
                    <Alert className="alert" variant="warning">No templates found. Create it from Menu {`->`} Edit Templates</Alert> :
                    (Object.keys(filter.values).length === 0 ?
                    <Alert className="alert" variant="info">No match found</Alert> :
                    Object.keys(filter.values).sort().map((i) => {
                        const typeId = i.replace(' ', '-').toLowerCase();

                        return (
                            <React.Fragment key={`${uuid()}`}>
                                <p key={`p-${typeId}`}  className="picker-block">{i}</p>
                                <Picker 
                                    key={`picker-${typeId}`} 
                                    items={filter.values[i]}
                                    comments={comments.current}
                                    type={i} 
                                    value={filter.var}
                                />
                            </React.Fragment>
                        )
                    })))
                }
            </div>
        </div>
    );
}

export default App;
