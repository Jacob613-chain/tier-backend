
import chai, { expect } from 'chai';
import { tierService } from '../src/services/tierService';

describe('tier test', () => {
    it('50$ tier should be bronze,next tier should be sliver', () => {
        const tiers = tierService.getTier(5000);
        expect(tiers.currentTier.tierId).to.be.equal(0);
        expect(tiers.nextTier.tierId).to.be.equal(1);
        expect(tiers.isMaxTier).to.be.equal(false);
    });
    it('150$ tier should be sliver,next tier should be gold', () => {
        const tiers = tierService.getTier(15000);
        expect(tiers.currentTier.tierId).to.be.equal(1);
        expect(tiers.nextTier.tierId).to.be.equal(2);
        expect(tiers.isMaxTier).to.be.equal(false);
    });
    it('500$ tier should be gold,next tier should be gold', () => {
        const tiers = tierService.getTier(50000);
        expect(tiers.currentTier.tierId).to.be.equal(2);
        expect(tiers.nextTier.tierId).to.be.equal(2);
        expect(tiers.isMaxTier).to.be.equal(true);
    });
});