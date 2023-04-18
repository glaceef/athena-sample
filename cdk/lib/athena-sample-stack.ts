import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, DatabaseProxy, ProxyTarget } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { makeSecurityGroup, makeSubnetGroup } from './utils';

export class AthenaSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'athena-example-vpc', {
      vpcName: 'athena-example-vpc',
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const subnetGroup = makeSubnetGroup(this, 'rds', vpc, {
      subnetType: SubnetType.PUBLIC,
    });

    const rdsSecurityGroup = makeSecurityGroup(this, 'rds', vpc, {
      allowAllOutbound: false,
    });
    rdsSecurityGroup.addIngressRule(
      Peer.ipv4('59.138.20.188/32'),
      Port.tcp(5432),
      'Allow connections from home'
    );
    rdsSecurityGroup.addIngressRule(
      Peer.ipv4('54.64.9.205/32'),
      Port.tcp(5432),
      'Allow connections from VPS01'
    );
    rdsSecurityGroup.addIngressRule(
      Peer.ipv4('153.126.215.118/32'),
      Port.tcp(5432),
      'Allow connections from VPS20'
    );

    const dbUser = 'athena_sample';
    const rdsCredentials = Credentials.fromGeneratedSecret(dbUser, {
      secretName: 'athena-sample-rds-credentials',
    });

    new DatabaseInstance(this, 'athena-sample-rds', {
      instanceIdentifier: 'athena-sample-rds',
      engine: DatabaseInstanceEngine.POSTGRES,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
      credentials: rdsCredentials,
      multiAz: true,
      autoMinorVersionUpgrade: false,
      publiclyAccessible: true,
      backupRetention: undefined,

      // postgresのシェルコマンドでは作成するDB名にハイフンを含めることができるが、
      // engineがPostgresのRDSの場合はバリデーションエラーになる。
      // databaseName: 'test-staging',

      vpc,
      subnetGroup: subnetGroup,
      securityGroups: [rdsSecurityGroup],

      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
