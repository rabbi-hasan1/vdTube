class apiError extends Error{
    constructor(statusCode, message="internal server error", errors=[], stack="")  {
        super(message);
        this.statusCode = statusCode;
        this.message= message;
        this.data = null;
        this.errors = errors;
        this.cause = message;
        this.success = false;
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}