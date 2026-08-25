import ExpoModulesCore
import FamilyControls

private final class UnsupportedScreenTimeVersionException: Exception {
  override var reason: String {
    "Individual Screen Time authorization requires iOS 16 or newer."
  }
}

public final class RebootScreenTimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("RebootScreenTime")

    AsyncFunction("getAuthorizationStatus") { () async -> String in
      await MainActor.run {
        self.currentAuthorizationStatus()
      }
    }

    AsyncFunction("requestAuthorization") { () async throws -> String in
      guard #available(iOS 16.0, *) else {
        throw UnsupportedScreenTimeVersionException()
      }

      try await AuthorizationCenter.shared.requestAuthorization(for: .individual)

      return await MainActor.run {
        self.currentAuthorizationStatus()
      }
    }
  }

  @MainActor
  private func currentAuthorizationStatus() -> String {
    guard #available(iOS 16.0, *) else {
      return "unsupported"
    }

    switch AuthorizationCenter.shared.authorizationStatus {
    case .notDetermined:
      return "notDetermined"
    case .denied:
      return "denied"
    case .approved:
      return "approved"
    @unknown default:
      // Newer SDKs may add a more permissive approved state. The React layer
      // only needs to know whether standard Screen Time access is authorized.
      return "approved"
    }
  }
}
