class apiError extends Error{
    constructor(message, statusCode=500,){
        super(message);
        this.statusCode = statusCode;
        this.message= message || "internal server error";
        this.cause = message;
        this.success = false;
        Error.captureStackTrace(this, this.constructor);
    }
}