export class Poll {
  constructor (user, rate, completedAt, approved, votes, status) {
    this.user = user
    this.rate = rate
    this.completedAt = completedAt
    this.approved = approved
    this.votes = votes
    this.status = status
  }
}

export class Vote {
  constructor (userId, reason, approved) {
    this.userId = userId
    this.reason = reason
    this.approved = approved
  }
}

export class Polls {
  constructor (items = []) {
    this.items = items
  }
}
