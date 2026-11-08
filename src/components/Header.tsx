import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import FormCheckInput from 'react-bootstrap/FormCheckInput';
import Button from 'react-bootstrap/Button';
import { GoX } from 'react-icons/go';
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs';

type ThemeSource = 'light' | 'dark';

const themeIcon: Record<ThemeSource, JSX.Element> = {
    light: <BsSunFill />,
    dark: <BsMoonStarsFill />
};

type HeaderProps = {
    filter: FilterProps,
    theme: ThemeSource,
    toggleTheme: () => void,
    selectSearchItem: (eventKey: string | null) => void,
    selectByPaternOnRestore: (pattern: string) => void,
    resetItems: () => void,
    selectByPatern: (pattern: string) => void,
    searchComments: boolean,
    toggleSearchComments: () => void,
    matchVars: (e: HTMLInputElement) => void,
    assignVar: (e: HTMLInputElement) => void,
    getIndexOf: (nodeList: NodeListOf<ChildNode>, element: Element) => number|null
};

const Header = ({
        filter,
        theme,
        toggleTheme,
        selectSearchItem,
        selectByPaternOnRestore,
        resetItems,
        selectByPatern,
        searchComments,
        toggleSearchComments,
        matchVars,
        assignVar,
        getIndexOf
    }: HeaderProps) => { 

    return (
        <div id="header">
            <InputGroup>
                <Dropdown onSelect={ selectSearchItem }>
                    <Dropdown.Toggle
                        id="type-selector"
                        variant={`${filter.picked.length > 1 ? "secondary" : "primary"}`}
                        title="Show templates of one type only"
                    >
                        {`${filter.picked.length > 1 || filter.picked.length === 0 ? "Pick template type" : filter.picked[0]}`}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item key="Restore" eventKey="All types"
                            title="Show templates of all types"
                            onClick={() => {
                                const searchBox = document.getElementById('search-pattern') as HTMLInputElement;
                                selectByPaternOnRestore(searchBox.value);
                            }}
                        >All types</Dropdown.Item>
                        <Dropdown.Divider />
                            {filter.types.sort().map((i) => {
                                return (<Dropdown.Item key={`dpItem-${i}`} eventKey={`${i}`}>{i}</Dropdown.Item>)
                            })}
                        <Dropdown.Divider />
                        <Dropdown.Item key="Reset" eventKey="Reset"
                            title="Show all templates and clear the search"
                            onClick={resetItems}
                        >Reset</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <FormControl 
                    id="search-pattern"
                    placeholder="Search template"
                    type="text"
                    onChange={(e) => {
                        e.preventDefault();
                        selectByPatern(e.target.value);
                    }}
                />
                <InputGroup.Text title="Include comments in search">
                    <FormCheckInput
                        id="search-comments"
                        className="mt-0"
                        type="checkbox"
                        checked={searchComments}
                        onChange={toggleSearchComments}
                        aria-label="Include comments in search"
                    />
                </InputGroup.Text>
                <Button variant="danger"
                    className='btn-reset'
                    title="Clear search"
                    aria-label="Clear search"
                    onClick={() => {
                        const searchPatternBox = document.getElementById('search-pattern') as HTMLInputElement;
                        searchPatternBox.value = '';
                        selectByPatern('');
                        searchPatternBox.focus();
                    }}
                ><GoX /></Button>
                <div className="washer"></div>
                <div>
                    <FormControl 
                        id="substitute-box"
                        className="substitute-value" 
                        placeholder="Substitute value"
                        type="text"
                        onChange={(e) => {
                            e.preventDefault();
                            matchVars(e.target as HTMLInputElement);
                            assignVar(e.target as HTMLInputElement);
                        }}
                        onKeyUp={(e) => {
                            const searchBox = document.getElementById('live-var-search');
                            if (!searchBox) return;

                            const items = searchBox.childNodes;
                            const selectedItem = searchBox.querySelector('li.selected');
                            const selectedItemIndex = selectedItem ? getIndexOf(items, selectedItem) : null;

                            // Move the highlight to the item at `index`, wrapping around both ends
                            const select = (index: number) => {
                                selectedItem?.classList.remove('selected');
                                (items.item((index + items.length) % items.length) as Element).classList.add('selected');
                            };

                            if (e.which === 40) {       // down
                                if (items.length > 0) {
                                    select(selectedItemIndex == null ? 0 : selectedItemIndex + 1);
                                }
                            }
                            else if (e.which === 38) {  // up
                                if (items.length > 0) {
                                    select(selectedItemIndex == null ? -1 : selectedItemIndex - 1);
                                }
                            }
                            else if (e.which === 13) {  // enter
                                if (selectedItem) {
                                    const templateBox = document.getElementById('substitute-box') as HTMLInputElement;
                                    templateBox.value = (selectedItem as HTMLElement).innerText;
                                    assignVar(templateBox);
                                }
                                searchBox.classList.add('empty');
                            }
                        }}                                                
                    />
                    <ul id="live-var-search" className="empty"></ul>
                </div>
                <Button variant="success"
                    title="Paste clipboard text as the substitute value"
                    onClick={() => {
                        const target = document.getElementById('substitute-box') as HTMLInputElement;
                        window.electron.pasteFromClipboard(target);
                        assignVar(target);
                    }}
                >Paste</Button>
                <Button variant="danger"
                    className='btn-reset'
                    title="Clear substitute value"
                    aria-label="Clear substitute value"
                    onClick={() => {
                        const templateBox = document.getElementById('substitute-box') as HTMLInputElement;
                        templateBox.value = '';
                        matchVars(templateBox);
                        assignVar(templateBox);
                        templateBox.focus();
                    }}
                ><GoX /></Button>
                <div className="washer"></div>
                <Button
                    variant="outline-secondary"
                    className="btn-theme"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                    onClick={toggleTheme}
                >{themeIcon[theme]}</Button>
            </InputGroup>
        </div>
    );
};

export default Header;
