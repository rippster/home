namespace WebApplication1.Services
{
    public class TimeZoneService
    {
        private HttpClient httpClient;

        public TimeZoneService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }

        public async Task<DateTime> GetTimeAsync(string ianaTimeToGet)
        {
            var payload = new
            {
                dateTime = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                fromTimezone = "Europe/London",
                toTimezone = ianaTimeToGet
            };

            HttpResponseMessage response = await httpClient.PostAsJsonAsync("convert", payload);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
                if (result != null && result.TryGetValue("dateTime", out string dateTimeString))
                {
                    return DateTime.Parse(dateTimeString);
                }
            }

            return DateTime.Now;
        }
    }
}
