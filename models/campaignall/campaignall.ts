import { Campaign } from '../campaign/campaign';
import { CampaignPlan } from '../campaignplan/campaignplan';
import { CampaignRenov } from '../campaignrenov/campaignrenov';

export class CampaignAll {
  constructor(
    public campaign: Campaign,
    public campaignPlan: CampaignPlan,
    public listCampaignRenov: CampaignRenov[],
  ) {}
}
