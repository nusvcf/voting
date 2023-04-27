package db_test

import (
	"github.com/nusvcf/voting/backend/utils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"time"
)

const emptyUuid = "00000000-0000-0000-0000-000000000000"

var _ = Describe("Login", func() {
	AfterEach(func() {
		_ = dbObj.DeleteAllVoters()
	})

	It("can create account", func() {
		var err error

		newVoter := utils.CreateVoter()
		newVoter.ID, err = dbObj.CreateVoter(newVoter)

		Expect(err).To(BeNil())
		Expect(newVoter.ID.String()).ToNot(Equal(emptyUuid))
	})

	When("there is an existing voter", func() {
		voter := utils.CreateVoter()

		BeforeEach(func() {
			voter.ID, _ = dbObj.CreateVoter(voter)
		})

		AfterEach(func() {
			_ = dbObj.DeleteVoter(voter.ID)
		})

		It("can retrieve single voter for login", func() {
			id, err := dbObj.CheckSingleVoter(voter.Username, voter.Password)
			Expect(err).To(BeNil())
			Expect(id).To(Equal(voter.ID))
		})

		It("correctly handles wrong passwords", func() {
			id, err := dbObj.CheckSingleVoter(voter.Username, "incorrectpassword")
			Expect(err).ToNot(BeNil())
			Expect(id.String()).To(Equal(emptyUuid))
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
				Expect(id.String()).To(Equal(emptyUuid))
			})

			It("shows invalidated timestamp in get voters call", func() {
				voterFromDB := utils.GetVoterById(voter.ID)
				Expect(voterFromDB.Invalidated.Valid).To(BeTrue())
				Expect(time.Since(voterFromDB.Invalidated.Time).Seconds()).To(BeNumerically("<", 1))
			})
		})
	})

})
