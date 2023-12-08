grammar MyLanguage

entry Model:
    aNumber=INT
    (statements+=Statement*);

Statement: 
    (VarDecl | Assignment);

VarDecl:
    (severalInt+=INT*)
    'var' name=ID ";";

Assignment : left=VarRef ":=" value = INT;

VarRef : 
    ref=[VarDecl];

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

