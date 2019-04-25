var undoStack = [];

function mkUndo (toolName) {
    var undoSelector = '#' + toolName + '-submit-undo';
    var textSelector = '#' + toolName + '-text';

    $(undoSelector).click(function (ev) {
        ev.preventDefault();

        var last = undoStack.pop();
        $(textSelector).val(last);

        if (undoStack.length == 0) {
            $(undoSelector).hide();
        }
    });
}

function mkTool (toolName, computeFn, opts) {
    opts = opts || {};

    var submitSelector = '#' + toolName + '-submit';
    var undoSelector = '#' + toolName + '-submit-undo';
    var textSelector = '#' + toolName + '-text';

    $(submitSelector).click(function () {
        var text = $(textSelector).val();
        if (!opts.allowEmptyText) {
            if (!text.length) return;
        }

        $('#action-error').hide();

        try {
            if (opts.asyncResultFn) {
                computeFn(text, opts.asyncResultFn);
            }
            else {
                var result = computeFn(text, opts.asyncResultFn);
                $(textSelector).val(result);
            }
        }
        catch (err) {
            if (opts.exceptionFn) opts.exceptionFn(err);
            return;
        }

        undoStack.push(text);

        $(undoSelector).show();
    });

    mkUndo(toolName);
}

$(function () {
    mkTool(
        'text-from-regex',
        function (text) {
            var howMany = parseInt($('#text-from-regex-how-many').val(), 10);
            var regex = $('#text-from-regex-regex').val();
            var ret = '';
            for (var i = 1; i <= howMany; i++) {
                var r = new RandExp(regex);
                ret += r.gen();
                ret += "\n";
            }
            return ret;
        },
        {
            allowEmptyText : true,
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );
    // make regex-replace tool work//
    mkTool(
        'regex-replace',
        function (text) {
            var regex = $('#regex-replace-regex').val();
            var regexParts = regex.match(/^\/(.*?)\/([gimuy]*)$/);
            if (regexParts) {
                var r = new RegExp(regexParts[1], regexParts[2]);
            } else {
                var r = new RegExp(regex);
            }
            var replaceTo = $('#regex-replace-to').val();
            text = text.replace(r, replaceTo);
            return text;
        },
        {
            exceptionFn : function (err) {
                $('#action-error').show();
                $('#action-error').text(err);
            }
        }
    );
});