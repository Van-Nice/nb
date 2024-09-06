export default class UserSettings {
    constructor({
        user_id,
        theme,
        font_family,
        font_size,
        line_height,
        auto_save,
        auto_save_interval,
        highlight_current_line,
        show_line_numbers,
        default_language,
        syntax_highlighting,
        editor_layout,
        cursor_blink_rate,
        bracket_matching,
        snippets_enabled,
        spell_check,
        indent_guides,
        word_wrap_column
    }) {
        this.user_id = user_id;
        this.theme = theme;
        this.font_family = font_family;
        this.font_size = font_size;
        this.line_height = line_height;
        this.auto_save = auto_save;
        this.auto_save_interval = auto_save_interval;
        this.highlight_current_line = highlight_current_line;
        this.show_line_numbers = show_line_numbers;
        this.default_language = default_language;
        this.syntax_highlighting = syntax_highlighting;
        this.editor_layout = editor_layout;
        this.cursor_blink_rate = cursor_blink_rate;
        this.bracket_matching = bracket_matching;
        this.snippets_enabled = snippets_enabled;
        this.spell_check = spell_check;
        this.indent_guides = indent_guides;
        this.word_wrap_column = word_wrap_column;
    }
}