import { useParams } from 'react-router-dom'

function VenueDetail() {
  const { id } = useParams()

  return (
    <section>
      <h1>Venue Detail</h1>
      <p>Venue ID: {id}</p>
      {/* Image gallery + venue info + Favorite / Add to Plan / Get Directions */}
    </section>
  )
}

export default VenueDetail
