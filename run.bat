
REM Install dependencies if not already installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Start the project
echo Starting the project...
call npm start

