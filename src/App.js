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
            return window.electron.getTemplateSync();
        }
        catch(err) {
            return {};
        }
    }
    const data = useRef(getData());

    const getSubstitutes = () => {
        try {
            return window.electron.getSubstitutesSync().sort();
        }
        catch(err) {
            return {};
        }
    }
    const substitutes = useRef(getSubstitutes());

    const getComments = () => {
        try {
            return window.electron.getComments();
        }
        catch(err) {
            return {};
        }
    }
    const comments = useRef(getComments());

    const [filter, setFilter] = useState({
        types: [],      // all types
        var: '',        // _VAR_ replacement
        values: {},     // dict of types (key) with array of templates (value)
        picked: [],     // selected type
        search: '',     // search pattern case insensitive
        error: null     // error during initialization
    });

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
            setFilter({...filter, picked: [e], values: filtered});
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
        searchBox.value = '';
    }

    const selectByPatern = (pattern) => {
        
        if (pattern !== '') {           
            const f = Object.entries(data.current)
                        .map(i => [i[0], (i[1].filter(j => j.toLowerCase().includes(pattern.toLowerCase())))])
                        .filter(i => i[1].length > 0);

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
                        .filter(i => i[1].length > 0);

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

    const getIndexOf = (nodeList, element) => {
        for (var i=0; i<nodeList.length; i++) {
            if (nodeList.item(i) == element) {
                return i;
            }
        }
        return null;
    }

    const matchVars = (target) => {
        const matchList = substitutes.current.filter(i => i.includes(target.value));
        const searchBox = document.getElementById('live-var-search');

        if (target.value.length > 0 && matchList.length > 0) {
            searchBox.classList.remove('empty');

            while (searchBox.firstChild) {
                searchBox.removeChild(searchBox.firstChild);
            }

            for (var i = 0; i < matchList.length; i++) {
                const varItem = matchList[i];
                const li = document.createElement('li');
                li.addEventListener('click', (e) => {
                    target.value = e.target.innerText;
                    assignVar(target);
                    searchBox.classList.add('empty');
                });
                li.appendChild(document.createTextNode(varItem));
                searchBox.appendChild(li);
            }

            if (target.value == matchList[0]) {
                searchBox.classList.add('empty');
            }
        }
        else {
            searchBox.classList.add('empty');
        }
    }

    const assignVar = (target) => {     
        setFilter({
            ...filter,
            var: target.value
        });
        if (target.value != '') {
            target.classList.add('filled');
        }
        else {
            target.classList.remove('filled');
        }
    }

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            setFilter({...filter, 
                types: Object.keys(data.current), 
                values: data.current,
                picked: Object.keys(data.current),
                error: "error" in data.current ? data.current.error : null
            });
        }
    }, [data]);

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
                        <Dropdown.Item key="Restore" eventKey="Restore"
                            onSelect={() => {
                                const searchBox = document.getElementById('search-pattern');
                                selectByPaternOnRestore(searchBox.value);
                            }}
                        >All types</Dropdown.Item>
                        <Dropdown.Divider />
                        {filter.types.sort().map((i) => {
                            return (<Dropdown.Item key={`dpItem-${i}`} eventKey={`${i}`}>{i}</Dropdown.Item>)
                        })}
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
                                const searchPatternBox = document.getElementById('search-pattern');
                                searchPatternBox.value = '';
                                selectByPatern('');
                                searchPatternBox.focus();
                            }}
                        ><GoX /></Button>
                    </InputGroup.Append>
                    <div className="washer"></div>
                    <div>
                    <FormControl 
                        id="template-box"
                        className="template-value" 
                        placeholder="Template value"
                        type="text"
                        onChange={(e) => {
                            e.preventDefault();
                            matchVars(e.target);
                            assignVar(e.target);
                        }}
                        onKeyUp={(e) => {
                            const searchBox = document.getElementById('live-var-search');
                            const selectedItem = document.querySelector('#live-var-search li.selected');
                            const selectedItemIndex = getIndexOf(searchBox.childNodes, selectedItem);

                            if (e.which === 40) {       // down
                                if (selectedItemIndex == null && searchBox.childNodes.length >= 1) {
                                    searchBox.firstChild.classList.add('selected');
                                }
                                else if (selectedItemIndex == searchBox.childNodes.length-1) {
                                    searchBox.lastChild.classList.remove('selected');
                                    searchBox.firstChild.classList.add('selected');
                                }
                                else {
                                    searchBox.childNodes.item(selectedItemIndex).classList.remove('selected');
                                    searchBox.childNodes.item(selectedItemIndex+1).classList.add('selected');
                                }
                            }
                            else if (e.which === 38) {  // up
                                if (selectedItemIndex == null && searchBox.childNodes.length >= 1) {
                                    searchBox.lastChild.classList.add('selected');
                                }
                                else if (selectedItemIndex == 0) {
                                    searchBox.firstChild.classList.remove('selected');
                                    searchBox.lastChild.classList.add('selected');
                                }
                                else {
                                    searchBox.childNodes.item(selectedItemIndex).classList.remove('selected');
                                    searchBox.childNodes.item(selectedItemIndex-1).classList.add('selected');
                                }
                            }
                            else if (e.which === 13) {  // enter
                                if (selectedItemIndex != null) {
                                    const templateBox = document.getElementById('template-box');
                                    templateBox.value = selectedItem.innerText;
                                    assignVar(templateBox);
                                }
                                searchBox.classList.add('empty');
                            }
                        }}
                    />
                    <ul id="live-var-search" className="empty"></ul>
                    </div>
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
                                matchVars(templateBox);
                                assignVar(templateBox);
                                templateBox.focus();
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
