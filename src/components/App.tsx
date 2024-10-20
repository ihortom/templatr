import { useState, useRef, useEffect, StrictMode } from 'react';
import { Fragment } from 'react/jsx-runtime';
import Header from './Header';
import Picker from './Picker';
import Alert from 'react-bootstrap/Alert';
import {v4 as uuid} from 'uuid';


const App = () => {

    const getTemplates = (): object => {
        try {
            return window.electron.getTemplates();
        }
        catch(err) {
            return {};
        }
    }
    
    const templates = useRef(getTemplates());

    const getSubstitutes = (): string[] => {
        try {
            const data: string[] = window.electron.getSubstitutes();
            return Array.isArray(data) ? data.sort() : data;
        }
        catch(err) {
            return [];
        }
    }

    const substitutes = useRef(getSubstitutes());

    const getComments = (): object => {
        try {
            return  window.electron.getComments();
        }
        catch(err) {
            return {};
        }
    }

    const comments = useRef(getComments());

    const [filter, setFilter] = useState<FilterProps>({
        types: [],      // all types
        var: '',        // _VAR_ substitute
        values: {},     // dict of types (key) with array of templates (value)
        picked: [],     // selected type
        search: '',     // search pattern case insensitive
        error: null     // error during initialization
    });

    const selectSearchItem = (eventKey: string) => {
        if (eventKey !== 'Reset' && eventKey !== 'All types') {
            
            const filtered = {
                [eventKey]: (templates.current[eventKey as keyof typeof templates.current] as string[])
                    .filter((i: string) => i.toLowerCase().includes(filter.search.toLowerCase()))
            };         
          
            setFilter({
                ...filter,
                picked: [eventKey], 
                values: filtered
            });
        }
    };

    const resetItems = () => {
        setFilter({
            ...filter,
            types: Object.keys(templates.current), 
            values: templates.current,
            picked: Object.keys(templates.current),
            search: ''
        });

        // clear search box
        const searchBox = document.getElementById('search-pattern') as HTMLInputElement;
        if (searchBox) {
            searchBox.value = '';
        }
    }

    const selectByPatern = (pattern: string) => {    
        if (pattern !== '') {           
            const f = Object.entries(templates.current)
                        .map(i => [i[0], (i[1].filter((j: string) => j.toLowerCase().includes(pattern.toLowerCase())))])
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
                    Object.keys(templates.current)
                    .filter(key => filter.picked.includes(key))
                    .reduce((obj: { [key: string]: string[] }, key: string) => {
                        return {
                            ...obj,
                            [key]: (templates.current as { [key: string]: string[] })[key]
                        };
                    }, {}) : templates.current,
                search: ''
            });
        }
    }

    const selectByPaternOnRestore = (pattern: string) => {
        if (pattern !== '') {
            const f = Object.entries(templates.current)
                        .map(i => [i[0], (i[1].filter(
                            (j: string) => j.toLowerCase().includes(pattern.toLowerCase())))]
                        )
                        .filter(i => i[1].length > 0);

            const filtered = Object.fromEntries(f);

            setFilter({
                ...filter,
                types: Object.keys(templates.current),
                values: filtered,
                picked: [],
                search: pattern
            });
        }
        else {
            setFilter({
                ...filter,
                types: Object.keys(templates.current),
                values: templates.current,
                picked: Object.keys(templates.current),
                search: ''
            });
        }
    };

    const getIndexOf = (nodeList: NodeListOf<ChildNode>, element: Element) => {
        for (let i=0; i<nodeList.length; i++) {
            if (nodeList.item(i) == element) {
                return i;
            }
        }
        return null;
    };

    const matchVars = (target: HTMLInputElement) => {
        const matchList = substitutes.current.filter((i: string | string[]) => i.includes(target.value));
        const searchBox = document.getElementById('live-var-search');

        if (searchBox && target.value.length > 0 && matchList.length > 0) {
            searchBox.classList.remove('empty');

            while (searchBox.firstChild) {
                searchBox.removeChild(searchBox.firstChild);
            }

            for (let i = 0; i < matchList.length; i++) {
                const varItem = matchList[i];
                const li = document.createElement('li');
                li.addEventListener('click', (e) => {
                    if (e.target instanceof HTMLElement) {
                        target.value = e.target.innerText;
                        assignVar(target);
                        searchBox.classList.add('empty');
                    }
                });
                li.appendChild(document.createTextNode(varItem));
                searchBox.appendChild(li);
            }

            if (target.value === matchList[0]) {
                searchBox.classList.add('empty');
            }
        }
        else if (searchBox) {
            searchBox.classList.add('empty');
        }
    };

    const assignVar = (target: HTMLInputElement) => {     
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
    };

    useEffect(() => {
        if (Object.keys(templates).length > 0 && 'current' in templates && typeof templates.current === 'object') {
            setFilter({...filter, 
                types: Object.keys(templates.current), 
                values: templates.current,
                picked: Object.keys(templates.current),
                error: null
            });
        }
    }, []);

    return (
        <StrictMode>
            <div className="App">
                <Header 
                    filter={filter}
                    selectSearchItem={selectSearchItem}
                    selectByPaternOnRestore={selectByPaternOnRestore}
                    resetItems={resetItems}
                    selectByPatern={selectByPatern}
                    matchVars={matchVars}
                    assignVar={assignVar}
                    getIndexOf={getIndexOf}
                />
                <div id="templates">
                    {
                        filter.error !== null ?
                        <>
                            <Alert className="alert" variant="danger">Template Error: {filter.error}</Alert>
                            <Alert className="alert" variant="warning">Edit templates from Menu {`→`} Edit Templates</Alert> 
                        </>:
                        (Object.keys(filter.values).length === 0 && filter.search.length === 0 ?
                        <Alert className="alert" variant="warning">No templates found. Create it from Menu {`→`} Edit Templates</Alert> :
                        (Object.keys(filter.values).length === 0 ?
                        <Alert className="alert" variant="info">No match found</Alert> :
                        Object.keys(filter.values).sort().map((i) => {
                            const typeId = i.replace(' ', '-').toLowerCase();
                            return (
                                <Fragment key={`${uuid()}`}>
                                    <p key={`p-${typeId}`}  className="picker-block">{i}</p>
                                    <Picker 
                                        key={`picker-${typeId}`} 
                                        items={filter.values[i as keyof typeof filter.values]}
                                        comments={comments.current}
                                        type={i} 
                                        value={filter.var}
                                    />
                                </Fragment>
                            )
                        })))
                    }
                </div>
            </div>
        </StrictMode>
    );
};

export default App;
