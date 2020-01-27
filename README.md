# vcf-voting

## Preparation

1. SSH into the server, where the package is located:

    ```
    ssh vcfvotes@in1325.yenter.io -p 326
    cd vcf-voting
    ```

2. Create the admin password:

    ```
    cd backend
    rm local.storage
    node generatePassword.js
    ```

3. Restart the service:

    ```
    sudo systemctl restart vcf-votes
    ```

4. Log in to the UI by using username = `admin` and password to whatever you set. 
5. Generate the voting slips as required. 

## Execution