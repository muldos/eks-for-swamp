// lib/my-eks-blueprints-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_eks as eks } from "aws-cdk-lib";
import { PlatformTeam } from '@aws-quickstart/eks-blueprints';

export default class ClusterConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    const hostedZoneID =  this.node.tryGetContext('hostedZoneID');
    const hostedZoneDomain = this.node.tryGetContext('hostedZoneDomain');
    const ownerPrefix = this.node.tryGetContext('ownerPrefix');
    const clusterAdminRole = this.node.tryGetContext('clusterAdminRole');
    const instanceSize = this.node.tryGetContext('instanceSize') || 'm5.xlarge';
    const account = props?.env?.account!;
    const region = props?.env?.region!;
    const adminTeam = new PlatformTeam( {
      name: `${ownerPrefix}-clusteradm`,
      userRoleArn: `arn:aws:iam::${account}:role/${clusterAdminRole}`
    });
    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.ArgoCDAddOn(),// Argocd already installed
      new blueprints.addons.MetricsServerAddOn(),// allow cluster monitoring
      new blueprints.addons.ClusterAutoScalerAddOn(), // autoscaling of nodes
      new blueprints.addons.VpcCniAddOn(),// VPC CNI integration - eks default - no need for calico on a demo cluster
      new blueprints.addons.ExternalsSecretsAddOn({}),// allow to use AWS secret as k8s secret (ie: licenses)
      new blueprints.ExternalDnsAddOn({ // allow to add a proper dns name from an hosted zone to an ALB ingress for example
        hostedZoneResources: [ blueprints.GlobalResources.HostedZone ]
      }),
      new blueprints.addons.EbsCsiDriverAddOn(),// allow EBS as PV
      new blueprints.addons.CoreDnsAddOn(), // internal DNS
      new blueprints.addons.KubeProxyAddOn(), // kubeproxy
      new blueprints.addons.AwsLoadBalancerControllerAddOn(), // allow ALB as ingress
      new blueprints.addons.CertManagerAddOn()
  ];

  // allow to customize the cluster 
  const clusterProps: blueprints.MngClusterProviderProps = {
    minSize: 2,
    maxSize: 6,
    desiredSize: 2,
    instanceTypes: [new ec2.InstanceType(instanceSize)],
    amiType: eks.NodegroupAmiType.AL2_X86_64,
    nodeGroupCapacityType: eks.CapacityType.ON_DEMAND,
    version: eks.KubernetesVersion.V1_25
  }
  const clusterProvider = new blueprints.MngClusterProvider(clusterProps);

    const blueprint = blueprints.EksBlueprint.builder()
    .account(account)
    .clusterProvider(clusterProvider)
    .region(region)
    //import the hosted zone from ID & Root domain
    .resourceProvider(blueprints.GlobalResources.HostedZone, new blueprints.ImportHostedZoneProvider(hostedZoneID, hostedZoneDomain))
    .addOns(...addOns)
    .teams(adminTeam)
    .build(scope, id+`-${ownerPrefix}-stack`);
    cdk.Tags.of(blueprint).add("Owner", ownerPrefix);
    cdk.Tags.of(blueprint).add("Team", "DevAcc");  
    cdk.Tags.of(blueprint).add("Purpose", "Demo");  
    cdk.Tags.of(blueprint).add("Customer", "None");  
    cdk.Tags.of(blueprint).add("Notes", "Curation env for demo backup and self enablement");  
  }
}

