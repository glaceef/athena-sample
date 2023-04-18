#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AthenaSampleStack } from '../lib/athena-sample-stack';

const app = new cdk.App();

const env = {
  account: '437307506719',
  region: 'us-east-1',
};

new AthenaSampleStack(app, 'athena-sample', {
  env,
});
