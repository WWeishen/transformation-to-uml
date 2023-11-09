import type { ValidationAcceptor, ValidationChecks, AstNode} from 'langium';
import { type MiniLogoAstType, type Model, isModel, isDef} from './generated/ast.js';
import type { MiniLogoServices } from './mini-logo-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MiniLogoServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MiniLogoValidator;
    const checks: ValidationChecks<MiniLogoAstType> = {
        //Person: validator.checkPersonStartsWithCapital
        Model:(m:Model, accept: ValidationAcceptor)=>{
            Def : validator.checkUniqueDef
            Param :validator.checkUniqueParam
        }
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MiniLogoValidator {

    checkUniqueDef(model: AstNode, accept: ValidationAcceptor): void {
        if (!isModel(model)) {
            throw new Error('Retrieve a non-model in validation');
        }
        const reported = new Set();
        model.defs.forEach(d => {
                if (reported.has(d.name)) {
                    accept('error',  `Def has non-unique name '${d.name}'.`,  {node: d, property: 'name'});
                }
                reported.add(d.name);
        });

    }

    checkUniqueParam(def: AstNode, accept: ValidationAcceptor): void{
        if (!isDef(def)) {
            throw new Error('Retrieve a non-def in validation');
        }
        const reported = new Set();
        def.params.forEach(p => {
                if (reported.has(p.name)) {
                    accept('error',  `Def has non-unique name '${p.name}'.`,  {node: p, property: 'name'});
                }
                reported.add(p.name);
            //}
        });
    }
}
