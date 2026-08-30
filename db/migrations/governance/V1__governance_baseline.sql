-- Governance Schema Baseline
-- DAOS Platform - Sub-Project #10

CREATE SCHEMA IF NOT EXISTS governance;

-- Proposals Table
CREATE TABLE IF NOT EXISTS governance.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_by_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    voting_mechanism TEXT NOT NULL,
    quorum_percentage NUMERIC NOT NULL DEFAULT 50,
    voting_start_at TIMESTAMPTZ,
    voting_end_at TIMESTAMPTZ,
    vote_for_count INTEGER DEFAULT 0,
    vote_against_count INTEGER DEFAULT 0,
    vote_abstain_count INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    shares_voting INTEGER DEFAULT 0,
    shares_eligible INTEGER NOT NULL,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_tenant ON governance.proposals(tenant_id);
CREATE INDEX idx_proposals_status ON governance.proposals(status);
CREATE INDEX idx_proposals_voting_open ON governance.proposals(status) WHERE status = 'votingOpen';

-- Votes Table
CREATE TABLE IF NOT EXISTS governance.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    proposal_id UUID NOT NULL REFERENCES governance.proposals(id) ON DELETE CASCADE,
    voted_by UUID NOT NULL,
    choice TEXT NOT NULL CHECK (choice IN ('for', 'against', 'abstain')),
    shares INTEGER NOT NULL,
    voted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_votes_proposal ON governance.votes(proposal_id);
CREATE INDEX idx_votes_voter ON governance.votes(voted_by);
CREATE INDEX idx_votes_tenant ON governance.votes(tenant_id);

-- Meetings Table
CREATE TABLE IF NOT EXISTS governance.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ,
    location TEXT,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_tenant ON governance.meetings(tenant_id);
CREATE INDEX idx_meetings_status ON governance.meetings(status);
CREATE INDEX idx_meetings_scheduled ON governance.meetings(scheduled_at);

-- Meeting Proposals Junction Table
CREATE TABLE IF NOT EXISTS governance.meeting_proposals (
    meeting_id UUID NOT NULL REFERENCES governance.meetings(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES governance.proposals(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (meeting_id, proposal_id)
);

CREATE INDEX idx_meeting_proposals_meeting ON governance.meeting_proposals(meeting_id);
CREATE INDEX idx_meeting_proposals_proposal ON governance.meeting_proposals(proposal_id);
