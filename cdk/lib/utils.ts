import { RemovalPolicy, Tags } from "aws-cdk-lib";
import { SecurityGroup, SecurityGroupProps, SubnetSelection, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { SubnetGroup } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

type SecurityGroupOptions = Partial<SecurityGroupProps>;

export function makeSecurityGroup(scope: Construct, id: string, vpc: Vpc, options: SecurityGroupOptions = {}): SecurityGroup {
  const name = `athena-sample-security-group-${id}`;

  const securityGroup = new SecurityGroup(scope, name, {
    ...options,
    securityGroupName: name,
    description: name,
    vpc,
  });
  Tags.of(securityGroup).add('Name', name);
  securityGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);

  return securityGroup;
}

export function makeSubnetGroup(
  scope: Construct,
  id: string,
  vpc: Vpc,
  subnetSelection?: SubnetSelection,
): SubnetGroup {
  const name = `athena-sample-subnet-group-${id}`;

  const subnetGroup = new SubnetGroup(scope, name, {
    subnetGroupName: name,
    description: name,
    vpc,
    // vpcSubnets: vpc.selectSubnets({ subnetType }),
    vpcSubnets: vpc.selectSubnets(subnetSelection),
  });
  // Tags.of(subnetGroup).add('Name', name);

  return subnetGroup;
}
