package db_test

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("DB Ballot", func() {
	var ballot structs.Ballot

	BeforeEach(func() {
		ballot = testutils.CreateBallot()
		_ = dbObj.CreateBallot(&ballot)
	})

	AfterEach(func() {
		_ = dbObj.DeleteAllBallots()
	})

	It("creates a ballot", func() {
		newBallot := testutils.CreateBallot()
		err := dbObj.CreateBallot(&newBallot)
		Expect(err).To(BeNil())
		Expect(newBallot.ID).ToNot(Equal(uuid.Nil))
	})

	It("gets ballot details with names", func() {
		ballots, err := dbObj.GetBallots()
		Expect(err).To(BeNil())
		Expect(ballots).To(ContainElement(testutils.EqualBallot(ballot)))
	})

	It("can close ballots", func() {

	})

	It("can invalidate ballots", func() {

	})
})
