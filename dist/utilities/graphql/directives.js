import { invariant } from 'ts-invariant';
import { visit } from 'graphql/language/visitor';

function shouldInclude(_a, variables) {
    var directives = _a.directives;
    if (!directives || !directives.length) {
        return true;
    }
    return getInclusionDirectives(directives).every(function (_a) {
        var directive = _a.directive, ifArgument = _a.ifArgument;
        var evaledValue = false;
        if (ifArgument.value.kind === 'Variable') {
            evaledValue = variables && variables[ifArgument.value.name.value];
            process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(evaledValue !== void 0, 91) : invariant(evaledValue !== void 0, 38) : process.env.NODE_ENV === "production" ? invariant(evaledValue !== void 0, 92) : invariant(evaledValue !== void 0, "Invalid variable referenced in @" + directive.name.value + " directive.");
        }
        else {
            evaledValue = ifArgument.value.value;
        }
        return directive.name.value === 'skip' ? !evaledValue : evaledValue;
    });
}
function getDirectiveNames(root) {
    var names = [];
    visit(root, {
        Directive: function (node) {
            names.push(node.name.value);
        },
    });
    return names;
}
function hasDirectives(names, root) {
    return getDirectiveNames(root).some(function (name) { return names.indexOf(name) > -1; });
}
function hasClientExports(document) {
    return (document &&
        hasDirectives(['client'], document) &&
        hasDirectives(['export'], document));
}
function isInclusionDirective(_a) {
    var value = _a.name.value;
    return value === 'skip' || value === 'include';
}
function getInclusionDirectives(directives) {
    var result = [];
    if (directives && directives.length) {
        directives.forEach(function (directive) {
            if (!isInclusionDirective(directive))
                return;
            var directiveArguments = directive.arguments;
            var directiveName = directive.name.value;
            process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(directiveArguments && directiveArguments.length === 1, 93) : invariant(directiveArguments && directiveArguments.length === 1, 39) : process.env.NODE_ENV === "production" ? invariant(directiveArguments && directiveArguments.length === 1, 94) : invariant(directiveArguments && directiveArguments.length === 1, "Incorrect number of arguments for the @" + directiveName + " directive.");
            var ifArgument = directiveArguments[0];
            process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(ifArgument.name && ifArgument.name.value === 'if', 95) : invariant(ifArgument.name && ifArgument.name.value === 'if', 40) : process.env.NODE_ENV === "production" ? invariant(ifArgument.name && ifArgument.name.value === 'if', 96) : invariant(ifArgument.name && ifArgument.name.value === 'if', "Invalid argument for the @" + directiveName + " directive.");
            var ifValue = ifArgument.value;
            process.env.NODE_ENV === "production" ? process.env.NODE_ENV === "production" ? invariant(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 97) : invariant(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 41) : process.env.NODE_ENV === "production" ? invariant(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 98) : invariant(ifValue &&
                (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), "Argument for the @" + directiveName + " directive must be a variable or a boolean value.");
            result.push({ directive: directive, ifArgument: ifArgument });
        });
    }
    return result;
}

export { getDirectiveNames, getInclusionDirectives, hasClientExports, hasDirectives, shouldInclude };
//# sourceMappingURL=directives.js.map
