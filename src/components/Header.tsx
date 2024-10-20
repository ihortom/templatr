import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import { GoX } from 'react-icons/go';


type HeaderProps = {
    filter: FilterProps,
    selectSearchItem: (e: string) => void,
    selectByPaternOnRestore: (pattern: string) => void,
    resetItems: () => void,
    selectByPatern: (pattern: string) => void,
    matchVars: (e: HTMLInputElement) => void,
    assignVar: (e: HTMLInputElement) => void,
    getIndexOf: (nodeList: NodeListOf<ChildNode>, element: Element) => number|null
};

const Header = ({
        filter,
        selectSearchItem,
        selectByPaternOnRestore,
        resetItems,
        selectByPatern,
        matchVars,
        assignVar,
        getIndexOf
    }: HeaderProps) => { 

    return (
        <div id="header">
            <InputGroup>
                <DropdownButton
                    id="type-selector"
                    title={`${filter.picked.length > 1 || filter.picked.length === 0 ? "Pick template type" : filter.picked[0]}`}
                    variant={`${filter.picked.length > 1 ? "secondary" : "primary"}`}
                    onSelect={ selectSearchItem }
                >
                    <Dropdown.Item key="Restore" eventKey="All types"
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
                        onClick={resetItems}
                    >Reset</Dropdown.Item>
                </DropdownButton>
                <FormControl 
                    id="search-pattern"
                    placeholder="Search template"
                    type="text"
                    onChange={(e) => {
                        e.preventDefault();
                        selectByPatern(e.target.value);
                    }}
                />
                <Button variant="danger"
                    className='btn-reset'
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
                            const selectedItem = document.querySelector('#live-var-search li.selected');
                            const selectedItemIndex = getIndexOf(searchBox.childNodes, selectedItem);

                            if (e.which === 40) {       // down
                                if (selectedItemIndex == null && searchBox.childNodes.length >= 1) {
                                    (searchBox.firstChild as Element).classList.add('selected');
                                }
                                else if (selectedItemIndex == searchBox.childNodes.length-1) {
                                    (searchBox.lastChild as Element).classList.remove('selected');
                                    (searchBox.firstChild as Element).classList.add('selected');
                                }
                                else {
                                    (searchBox.childNodes.item(selectedItemIndex) as Element).classList.remove('selected');
                                    (searchBox.childNodes.item(selectedItemIndex+1) as Element).classList.add('selected');
                                }
                            }
                            else if (e.which === 38) {  // up
                                if (selectedItemIndex == null && searchBox.childNodes.length >= 1) {
                                    (searchBox.lastChild as Element).classList.add('selected');
                                }
                                else if (selectedItemIndex == 0) {
                                    (searchBox.firstChild as Element).classList.remove('selected');
                                    (searchBox.lastChild as Element).classList.add('selected');
                                }
                                else {
                                    (searchBox.childNodes.item(selectedItemIndex) as Element).classList.remove('selected');
                                    (searchBox.childNodes.item(selectedItemIndex-1) as Element).classList.add('selected');
                                }
                            }
                            else if (e.which === 13) {  // enter
                                if (selectedItemIndex != null) {
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
                    onClick={() => {
                        const target = document.getElementById('substitute-box') as HTMLInputElement;
                        window.electron.pasteFromClipboard(target);
                        assignVar(target);
                    }}
                >Paste</Button>
                <Button variant="danger"
                    className='btn-reset'
                    onClick={() => {
                        const templateBox = document.getElementById('substitute-box') as HTMLInputElement;
                        templateBox.value = '';
                        matchVars(templateBox);
                        assignVar(templateBox);
                        templateBox.focus();
                    }}
                ><GoX /></Button>
            </InputGroup>
        </div>
    );
};

export default Header;
