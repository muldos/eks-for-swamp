# Welcome to EKS Swamps ready CDK  project

## CDK Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Steps to deploy the EKS cluster

Update $HOME/.aws/credentials
```
npm install
export CDK_DEFAULT_ACCOUNT= ...
export CDK_DEFAULT_REGION= ...
cdk deploy --all
```

## Accessing Argocd

```
kubectl port-forward svc/blueprints-addon-argocd-server -n argocd 8080:80
```

Then get the password :

```
kubectl get secrets/argocd-initial-admin-secret -n argocd --template={{.data.password}} | base64 -D;echo
```
<b> Warning : Remove the '%' at the end </b>


The login using https:localhost:8080 and admin / retrieved-password