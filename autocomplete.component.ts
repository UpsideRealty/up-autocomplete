import {
    Component,
    Input,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
    ViewChildren,
    QueryList,
    Renderer2, OnInit
} from '@angular/core';

let autocompleteCount = 0;

@Component({
    selector: 'up-autocomplete',
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent implements OnInit {
    @Input() filteredItems: string[] = [];
    @Input() maxListLength = 15;
    @Input() minFilterLength = 1;
    @Input() placeholder = 'Enter search term';
    @Input() forceFirstResult = false;
    @Input() showSearchButton = false;
    @Input() showIcon = true;
    @Input() customInputId = null;

    @Output() termChanged = new EventEmitter<string>();
    @Output() valueSelected = new EventEmitter<string>();

    @ViewChild('dropdown') dropdownRef: ElementRef;
    @ViewChild('autocompleteWrapper') autocompleteWrapperRef: ElementRef;
    @ViewChildren('dropdownItem') dropdownItemsRef: QueryList<ElementRef>;

    term = '';
    activeItemIndex = 0;
    autocompleteCount: number;
    inputId = '';

    constructor (private renderer2: Renderer2) {
        autocompleteCount++;
        this.autocompleteCount = autocompleteCount;
    }

    ngOnInit () {
        this.inputId = this.customInputId || `autocomplete-input-${this.autocompleteCount}`;
    }

    onTermChanged (term: string): void {
        this.term = term;
        this.activeItemIndex = 0;
        this.termChanged.emit(this.term);
    }

    onKeyDown (keyboardEvent: KeyboardEvent): void {
        switch (keyboardEvent.keyCode) {
            // Up arrow
            case 38:
                keyboardEvent.preventDefault();
                this.handleUpArrowPressed();
                this.updateDropdownScrollPosition();
                this.focusItem();
                break;
            // down arrow
            case 40:
                keyboardEvent.preventDefault();
                this.handleDownArrowPressed();
                this.updateDropdownScrollPosition();
                this.focusItem();
                break;
            // enter key
            case 13:
                this.onValueSelected(this.filteredItems[this.activeItemIndex]);
                break;
            // escape key
            case 27:
                this.resetInput();
                break;
        }
    }

    onValueSelected (value?: string) {
        // emits either passed value or first match in filter list

        if (!this.filteredItems.length) return;

        const selectedValue = value ? value : this.filteredItems[0];

        this.valueSelected.emit(selectedValue);
    }

    private resetInput (): void {
        this.onTermChanged('');
    }

    private focusItem (): void {
        if (this.filteredItems.length) {
            const focusedItem = this.dropdownItemsRef.toArray()[this.activeItemIndex];

            if (focusedItem) {
                focusedItem.nativeElement.focus();
            }
        }
    }

    private updateDropdownScrollPosition () {
        // adjust scrollbox position if focused element is above or below the list bounds

        if (this.activeItemIndex === -1) return;

        const activeItemBoundingBox = this.dropdownItemsRef.toArray()[this.activeItemIndex].nativeElement.getBoundingClientRect();
        const dropdownBoundingBox = this.dropdownRef.nativeElement.getBoundingClientRect();

        if (activeItemBoundingBox.top < dropdownBoundingBox.top) {
            const newTop = activeItemBoundingBox.height * this.activeItemIndex;

            this.renderer2.setProperty(
                this.dropdownRef.nativeElement,
                'scrollTop',
                newTop);
        }

        if (activeItemBoundingBox.bottom > dropdownBoundingBox.bottom) {
            let newBottom = 0;
            if (this.activeItemIndex === this.dropdownItemsRef.toArray().length - 1) {
                newBottom = (activeItemBoundingBox.height * this.activeItemIndex);
            } else {
                newBottom = (activeItemBoundingBox.height * this.activeItemIndex) - dropdownBoundingBox.height + activeItemBoundingBox.height;
            }

            this.renderer2.setProperty(
                this.dropdownRef.nativeElement,
                'scrollTop',
                newBottom);
        }
    }

    private handleUpArrowPressed () {
        this.activeItemIndex--;

        if (this.activeItemIndex < 0) {
            this.activeItemIndex = this.filteredItems.length - 1;
        }
    }

    private handleDownArrowPressed () {
        this.activeItemIndex++;

        if (this.activeItemIndex >= this.filteredItems.length) {
            this.activeItemIndex = 0;
        }
    }
}
