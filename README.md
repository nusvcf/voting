# vcf-voting

## Running in Development

To get up and running:
0. Prepare the backend:
    ```
    cd backend
    ```
    create a file titled ".env" which has the contents 'secret = "%%%"', where %%% is the password you plan to use for the admin account.
    
1. Start the backend:

    ```
    cd backend
    npm install # When first running, or if there are new packages
    node generatePassword.js # creating the admin password.  use this password to log in later.  The username is "admin"
    node index.js
    ```

2. Start the frontend:

    ```
    cd frontend
    npm install # When first running, or if there are new packages
    npm start
    ```

## Updating Production

1. SSH into the server, where the package is located:

    ```
    ssh vcfvotes@in1325.yenter.io -p 326
    cd vcf-voting
    ```

2. Pull any changes:

    ```
    git pull
    ```

3. Build the frontend:

    ```
    cd frontend
    npm run build
    ```

4. Restart the backend:

    ```
    sudo systemctl restart vcf-votes
    ```

## Preparation

1. Create the admin password:

    ```
    cd backend
    rm local.storage
    node generatePassword.js
    ```

2. Restart the service (either by stopping & starting the service locally, or running `sudo systemctl restart vcf-votes` on production)
3. Log in to the UI by using username = `admin` and password to whatever you set. 
4. Generate the voting slips as required. 

## Execution
