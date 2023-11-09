import type { AstNode,ValidationAcceptor, ValidationChecks } from 'langium';
import { MyLanguageAstType, Model, isVarDecl, isModel, VarDecl } from './generated/ast.js';
import type { MyLanguageServices } from './my-language-module.js';

/**
 * Register custom validation checks.
 */

export function registerValidationChecks(services: MyLanguageServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MyLanguageValidator;
    const checks: ValidationChecks<MyLanguageAstType> = {
        //Person: validator.checkPersonStartsWithCapital
        Model:(m:Model, accept: ValidationAcceptor)=>{
            //validate the model 'm' here
            //Model : validator.checkUniqueVarDecl,
            VarDecl : validator.checkUniqueVarDecl
        }
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */

export class MyLanguageValidator{

    checkUniqueVarDecl(model: AstNode, accept: ValidationAcceptor): void {
        if (!isModel(model)) {
            throw new Error('Retrieve a non-model in validation');
        }
        const reported = new Set();
        model.statements.forEach(s => {
            if (isVarDecl(s)){
                if (reported.has(s.name)) {
                    accept('error',  `Def has non-unique name '${s.name}'.`,  {node: s, property: 'name'});
                }
                reported.add((s as VarDecl).name);
            }
        });
    }
}
