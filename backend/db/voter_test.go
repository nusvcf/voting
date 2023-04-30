package db_test

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/testutils"
	"github.com/nusvcf/voting/backend/utils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"time"
)

var _ = Describe("DB Voter", func() {
	AfterEach(func() {
		_ = dbObj.DeleteAllVoters()
	})

	It("can create account", func() {
		var err error

		newVoter := testutils.CreateVoter()
		newVoter.ID, err = dbObj.CreateVoter(newVoter)

		Expect(err).To(BeNil())
		Expect(newVoter.ID).ToNot(Equal(uuid.Nil))
	})

	When("there is an existing voter", func() {
		voter := testutils.CreateVoter()

		BeforeEach(func() {
			voter.ID, _ = dbObj.CreateVoter(voter)
		})

		AfterEach(func() {
			_ = dbObj.DeleteAllVoters()
		})

		It("can retrieve single voter for login", func() {
			id, err := dbObj.CheckSingleVoter(voter.Username, voter.Password)
			Expect(err).To(BeNil())
			Expect(id).To(Equal(voter.ID))
		})

		It("returns that id is valid", func() {
			valid, err := dbObj.CheckIfVoterIdValid(voter.ID)
			Expect(err).To(BeNil())
			Expect(valid).To(BeTrue())
		})

		It("correctly handles wrong passwords", func() {
			id, err := dbObj.CheckSingleVoter(voter.Username, "incorrectpassword")
			Expect(err).ToNot(BeNil())
			Expect(id).To(Equal(uuid.Nil))
		})

		It("retrieves the list of users", func() {
			voters, err := dbObj.GetVoters()
			Expect(err).To(BeNil())
			Expect(voters).To(ContainElement(voter))
		})

		It("updates last seen", func() {
			err := dbObj.UpdateLastSeen(voter.ID)
			Expect(err).To(BeNil())

			voterFromDB := utils.GetVoterById(voter.ID)
			Expect(voterFromDB.LastSeen.Valid).To(BeTrue())
			Expect(time.Since(voterFromDB.LastSeen.Time).Seconds()).To(BeNumerically("<", 1))
		})

		It("can delete the voter", func() {
			err := dbObj.DeleteVoter(voter.ID)
			Expect(err).To(BeNil())

			voters, _ := dbObj.GetVoters()
			Expect(voters).ToNot(ContainElement(voter))
		})

		When("invalidating user", func() {
			BeforeEach(func() {
				err := dbObj.InvalidateVoter(voter.ID)
				Expect(err).To(BeNil())
			})

			It("prevents user from logging in", func() {
				id, err := dbObj.CheckSingleVoter(voter.Username, voter.Password)
				Expect(err).ToNot(BeNil())
				Expect(id).To(Equal(uuid.Nil))
			})

			It("shows invalidated timestamp in get voters call", func() {
				voterFromDB := utils.GetVoterById(voter.ID)
				Expect(voterFromDB.Invalidated.Valid).To(BeTrue())
				Expect(time.Since(voterFromDB.Invalidated.Time).Seconds()).To(BeNumerically("<", 1))
			})

			It("returns that id is not valid", func() {
				valid, err := dbObj.CheckIfVoterIdValid(voter.ID)
				Expect(err).To(BeNil())
				Expect(valid).To(BeFalse())
			})
		})
	})

	When("there are several voters, with different states", func() {
		BeforeEach(func() {
			_ = dbObj.DeleteAllVoters() // just to start from a clean slate

			id1, _ := dbObj.CreateVoter(testutils.CreateVoter())
			_, _ = dbObj.CreateVoter(testutils.CreateVoter())
			_, _ = dbObj.CreateVoter(testutils.CreateVoter())
			id4, _ := dbObj.CreateVoter(testutils.CreateVoter())
			id5, _ := dbObj.CreateVoter(testutils.CreateVoter())
			_ = dbObj.UpdateLastSeen(id1)
			_ = dbObj.InvalidateVoter(id4)
			_ = dbObj.InvalidateVoter(id5)
		})

		It("returns the correct number of valid voters", func() {
			numVoters, err := dbObj.GetNumValidVoters()
			Expect(err).To(BeNil())
			Expect(numVoters).To(Equal(1))
		})
	})
})
