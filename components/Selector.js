export const TypeAheadSelector = {

    options: [],
    suggestions: [],
    input_text: '',
    selected_value: null,
    callback: false,

    init(props) {
        this.options = props.options;
        let placeholder = props.placeholder ?? '';

        this.selector_input = document.createElement('input');
        this.selector_input.setAttribute('type', 'text');
        this.selector_input.setAttribute('placeholder', placeholder);
        this.selector_input.addEventListener('keyup', (event) => {
            this.onTextInput(event.target.value);
        });

        this.selector_list = document.createElement('ul');;
    },

    render(element, callback = false) {
        this.callback = callback;
        element.parentElement.appendChild(this.selector_input);
        let clear_button = document.createElement('button');
        clear_button.innerText = 'x';
        clear_button.addEventListener('click', () => {
            this.onClearSelection();
        })
        element.parentElement.appendChild(clear_button);
        element.parentElement.appendChild(this.selector_list);
    },

    renderSelections() {
        this.selector_list.innerHTML = '';
        if (this.suggestions.length > 0) {
            for (let idx in this.suggestions) {
                let suggestion = this.suggestions[idx];
                let item = document.createElement('li');
                item.innerText = suggestion.text;
                item.setAttribute('id', 'key_'+idx);
                item.setAttribute('data-key', suggestion.value);
                item.addEventListener('click', (event) => {
                    this.onSelection(event.target)
                });

                this.selector_list.appendChild(item);
            }   
        }
    },

    onTextInput(input_value) {
        let suggestions = [];
        this.input_text = input_value;
        if (this.input_text.length > 0) {
            const regex = new RegExp(`^${this.input_text}`, `i`);
            suggestions = this.options.sort().filter(v => regex.test(v.text));
        }

        this.suggestions = suggestions.splice(0, 10);

        this.renderSelections();
    },

    onSelection(element) {
        this.suggestions = [];
        this.selector_input.value = this.input_text = element.innerText;
        this.selected_value = element.getAttribute('data-key');

        if (this.callback) {
            this.callback.call({}, this.selected_value);
        }

        this.renderSelections();
    },

    onClearSelection() {
        this.suggestions = [];
        this.selector_input.value = this.input_text = '';
        this.selected_value = null;

        if (this.callback) {
            this.callback.call({}, this.selected_value);
        }

        this.renderSelections();
    }
}