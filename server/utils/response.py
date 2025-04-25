def error_response(message, status_code=400):
    return {
        "success": False,
        "error": message
    }, status_code

def success_response(data, status_code=200):
    return {
        "success": True,
        "data": data
    }, status_code